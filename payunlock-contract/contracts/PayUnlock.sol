// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

interface IERC20 {
  function transferFrom(address from, address to, uint256 amount) external returns (bool);
  function transfer(address to, uint256 amount) external returns (bool);
}

contract PayUnlock {
  uint64 public constant DEFAULT_SEND_CODE_WINDOW = 3 days; // 259200 seconds
  uint64 public constant DEFAULT_CONFIRM_WINDOW   = 5 days; // 432000 seconds
  enum Status { Initial, Paid, CodeSent, Completed, CompletedPaidout, Refunded }

  struct Product {
    // commercial terms
    //string seed;
    address seller;
    uint256 price;          // tinybars or token decimals
    address currency;       // address(0) = HBAR
    // lifecycle
    Status  status;
    string  fileId;         // HFS file id like "0.0.x"
    address buyer;
    // crypto material
    bytes   sellerPubKey;   // ECIES seller public key
    bytes   buyerPubKey;    // set by buyer on purchase
    bytes   encryptedSymKey;// set by seller after re-encryption
    // timeboxes (seconds)
    uint64  sendCodeWindow;   // how long seller has to call sendCode() after purchase
    uint64  confirmWindow;    // how long buyer has to confirm after CodeSent
    // timestamps & flags
    uint64  paidAt;
    uint64  codeSentAt;
  }

  uint256 public nextId;
  mapping(uint256 => Product) public products;

  // simple reentrancy guard
  bool private _locked;
  modifier nonReentrant() { require(!_locked, "reentrancy"); _locked = true; _; _locked = false; }

  modifier onlySeller(uint256 id) { require(msg.sender == products[id].seller, "not seller"); _; }
  modifier onlyBuyer(uint256 id)  { require(msg.sender == products[id].buyer, "not buyer"); _; }

  event ProductCreated(uint256 indexed id, address indexed seller, string fileId, uint256 price, address currency);
  event Purchased(uint256 indexed id, address indexed buyer, uint256 price, address currency, bytes buyerPubKey);
  event CodeSent(uint256 indexed id);
  event StatusChanged(uint256 indexed id, Status from, Status to);
  event Withdrawn(uint256 indexed id, address indexed seller, uint256 amount, address currency);
  event Refunded(uint256 indexed id, address indexed buyer, uint256 amount, address currency);


  string private debugMessage;

  function debugWrite(string calldata message) external {
    debugMessage = message;
  }

  function debugRead() external view returns (string memory) {
    return debugMessage;
  }


  function createProduct(
    string calldata fileId,
    uint256 price,
    address currency,           // address(0) for HBAR, or ERC-20/HTS mirror address
    bytes calldata sellerPubKey,
    bytes calldata encryptedSymKey
  ) external returns (uint256 id) {
    require(price > 0, "price=0");

    id = nextId++;
    products[id] = Product({
      seller: msg.sender,
      price: price,
      currency: currency,
      status: Status.Initial,
      fileId: fileId,
      buyer: address(0),
      sellerPubKey: sellerPubKey,
      buyerPubKey: "",
      encryptedSymKey: encryptedSymKey,
      sendCodeWindow: DEFAULT_SEND_CODE_WINDOW,
      confirmWindow: DEFAULT_CONFIRM_WINDOW,
      paidAt: 0,
      codeSentAt: 0
    });

    emit ProductCreated(id, msg.sender, fileId, price, currency);
  }

  // ---- BUY (escrow funds in contract) ----

  function buyWithHBAR(uint256 id, uint256 expectedPrice, bytes calldata buyerPubKey) external payable {
    Product storage p = products[id];
    require(p.status == Status.Initial, "not purchasable");
    require(p.currency == address(0), "not HBAR");
    require(expectedPrice == p.price, "price changed");
    require(msg.value == p.price, string(abi.encodePacked(
      "wrong amount: sent ",
      uintToString(msg.value),
      ", expected ",
      uintToString(p.price)
    )));

  require(p.buyer == address(0), "already bought");
    require(buyerPubKey.length > 0, "buyer key required");

    p.status = Status.Paid;
    p.buyer = msg.sender;
    p.buyerPubKey = buyerPubKey;
    p.paidAt = uint64(block.timestamp);

    emit Purchased(id, msg.sender, p.price, address(0), buyerPubKey);
    emit StatusChanged(id, Status.Initial, Status.Paid);
  }

  function buyWithERC20(uint256 id, uint256 expectedPrice, bytes calldata buyerPubKey) external {
    Product storage p = products[id];
    require(p.status == Status.Initial, "not purchasable");
    require(p.currency != address(0), "HBAR only");
    require(expectedPrice == p.price, "price changed");
    require(p.buyer == address(0), "already bought");
    require(buyerPubKey.length > 0, "buyer key required");

    // Transfer tokens into escrow (this contract)
    require(IERC20(p.currency).transferFrom(msg.sender, address(this), p.price), "transferFrom failed");

    p.status = Status.Paid;
    p.buyer = msg.sender;
    p.buyerPubKey = buyerPubKey;
    p.paidAt = uint64(block.timestamp);

    emit Purchased(id, msg.sender, p.price, p.currency, buyerPubKey);
    emit StatusChanged(id, Status.Initial, Status.Paid);
  }

  // ---- SELLER sends re-encrypted key ----
  function sendCode(uint256 id, bytes calldata encryptedSymKey) external onlySeller(id) {
    Product storage p = products[id];
    require(p.status == Status.Paid, "not in Paid");
    require(p.buyer != address(0), "no buyer");
    require(encryptedSymKey.length > 0, "empty key");

    p.encryptedSymKey = encryptedSymKey;
    p.codeSentAt = uint64(block.timestamp);

    Status prev = p.status;
    p.status = Status.CodeSent;

    emit CodeSent(id);
    emit StatusChanged(id, prev, Status.CodeSent);
  }

  // ---- BUYER confirms; seller withdraws escrow ----
  function confirmCompleted(uint256 id) external onlyBuyer(id) {
    Product storage p = products[id];
    require(p.status == Status.CodeSent, "not in CodeSent");

    Status prev = p.status;
    p.status = Status.Completed;

    emit StatusChanged(id, prev, Status.Completed);
  }

  function withdrawSeller(uint256 id) external nonReentrant onlySeller(id) {
    Product storage p = products[id];
    require(p.status == Status.Completed, "not Completed");

    Status prev = p.status;
    p.status = Status.CompletedPaidout;

    if (p.currency == address(0)) {
      (bool ok, ) = p.seller.call{value: p.price}("");
      require(ok, "HBAR payout failed");
    } else {
      require(IERC20(p.currency).transfer(p.seller, p.price), "token payout failed");
    }
    emit Withdrawn(id, p.seller, p.price, p.currency);
    emit StatusChanged(id, prev, Status.CompletedPaidout);
  }

  function withdrawSellerAfterConfirmTimeout(uint256 id) external nonReentrant onlySeller(id) {
    Product storage p = products[id];
    require(p.status == Status.CodeSent, "not CodeSent");
    require(block.timestamp > uint256(p.codeSentAt) + uint256(p.confirmWindow), "confirm window not expired");

    // finalize and pay out seller
    Status prev = p.status;
    p.status = Status.CompletedPaidout;

    if (p.currency == address(0)) {
      (bool ok, ) = p.seller.call{value: p.price}("");
      require(ok, "HBAR payout failed");
    } else {
      require(IERC20(p.currency).transfer(p.seller, p.price), "token payout failed");
    }

    emit Withdrawn(id, p.seller, p.price, p.currency);
    emit StatusChanged(id, prev, Status.CompletedPaidout);
  }

  // ---- Refund paths ----
  // 1) Seller missed sendCode window while in Paid  -> refund buyer
  function refundBuyer(uint256 id) external nonReentrant onlyBuyer(id){
    Product storage p = products[id];
    require(p.status == Status.Paid, "not Paid");
    require(block.timestamp > uint256(p.paidAt) + uint256(p.sendCodeWindow), "send window not expired");

    Status prev = p.status;
    p.status = Status.Refunded; // or RefundedPaidout if you rename

    if (p.currency == address(0)) {
      (bool ok, ) = p.buyer.call{value: p.price}("");
      require(ok, "HBAR refund failed");
    } else {
      require(IERC20(p.currency).transfer(p.buyer, p.price), "token refund failed");
    }

    emit StatusChanged(id, prev, Status.Refunded);
    emit Refunded(id, p.buyer, p.price, p.currency);
  }
  //todo replace with @openzeppelin/contracts/utils/Strings.sol";
  function uintToString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
      return "0";
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }
    return string(buffer);
  }

}
