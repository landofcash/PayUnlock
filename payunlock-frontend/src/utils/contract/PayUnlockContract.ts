import {Contract, ethers} from 'ethers';
import PayUnlockABI from '../../contracts/PayUnlock.sol/PayUnlock.json';

/**
 * PayUnlockContract class provides helper functions to interact with the PayUnlock smart contract
 */
export class PayUnlockContract {
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  /**
   * Constructor for PayUnlockContract
   * @param provider - Ethers provider
   * @param contractAddress - Optional contract address (uses default if not provided)
   * @param signer - Optional signer for transactions (required for write operations)
   */
  constructor(
    provider: ethers.Provider,
    contractAddress: string,
    signer?: ethers.Signer
  ) {
    // Initialize contract with read-only provider
    this.contract = new ethers.Contract(
      contractAddress,
      PayUnlockABI.abi,
      provider
    );

    // If the signer is provided, connect it to enable write operations
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer) as Contract;
    }
  }

  /**
   * Connect a signer to the contract to enable write operations
   * @param signer - Ethers signer
   * @returns The contract instance with signer connected
   */
  public connectSigner(signer: ethers.Signer): PayUnlockContract {
    this.signer = signer;
    this.contract = this.contract.connect(signer) as Contract;
    return this;
  }

  /**
   * Create a new product on the blockchain
   * @param fileId - Identifier for the product file
   * @param price - Price of the product
   * @param currency - Address of the ERC20 token used for payment (or zero address for HBAR)
   * @param sellerPubKey - Seller's public key for encryption
   * @returns Transaction receipt with the product ID
   */
  public async createProduct(
    fileId: string,
    price: string | number,
    currency: string,
    sellerPubKey: Uint8Array | string
  ): Promise<{ id: number; txHash: string }> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Convert price to BigInt if it's a number or string
    const priceValue = ethers.parseUnits(price.toString(), 18);

    // Convert sellerPubKey to proper format if it's a Uint8Array
    const pubKey = typeof sellerPubKey === 'string'
      ? sellerPubKey
      : ethers.hexlify(sellerPubKey);

    // Call the contract method
    const tx = await this.contract.createProduct(
      fileId,
      priceValue,
      currency,
      pubKey
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    // Extract product ID from events
    const event = receipt.logs
      .map((log: any) => {
        try {
          return this.contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .find((event: any) => event && event.name === 'ProductCreated');

    if (!event) {
      throw new Error('Product creation event not found in transaction logs');
    }

    return {
      id: Number(event.args.id),
      txHash: receipt.hash
    };
  }

  /**
   * Buy a product using ERC20 tokens
   * @param id - Product ID
   * @param expectedPrice - Expected price to verify
   * @param buyerPubKey - Buyer's public key for encryption
   * @returns Transaction receipt
   */
  public async buyWithERC20(
    id: number,
    expectedPrice: string | number,
    buyerPubKey: Uint8Array | string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Convert expectedPrice to BigInt if it's a number or string
    const priceValue = ethers.parseUnits(expectedPrice.toString(), 18);

    // Convert buyerPubKey to proper format if it's a Uint8Array
    const pubKey = typeof buyerPubKey === 'string'
      ? buyerPubKey
      : ethers.hexlify(buyerPubKey);

    // Call the contract method
    const tx = await this.contract.buyWithERC20(
      id,
      priceValue,
      pubKey
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Buy a product using HBAR
   * @param id - Product ID
   * @param expectedPrice - Expected price to verify
   * @param buyerPubKey - Buyer's public key for encryption
   * @returns Transaction receipt
   */
  public async buyWithHBAR(
    id: number,
    expectedPrice: string | number,
    buyerPubKey: Uint8Array | string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Convert expectedPrice to BigInt if it's a number or string
    const priceValue = ethers.parseUnits(expectedPrice.toString(), 18);

    // Convert buyerPubKey to proper format if it's a Uint8Array
    const pubKey = typeof buyerPubKey === 'string'
      ? buyerPubKey
      : ethers.hexlify(buyerPubKey);

    // Call the contract method with value
    const tx = await this.contract.buyWithHBAR(
      id,
      priceValue,
      pubKey,
      { value: priceValue }
    );

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Send the encrypted symmetric key to the buyer
   * @param id - Product ID
   * @param encryptedSymKey - Encrypted symmetric key
   * @returns Transaction receipt
   */
  public async sendCode(
    id: number,
    encryptedSymKey: Uint8Array | string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Convert encryptedSymKey to proper format if it's a Uint8Array
    const symKey = typeof encryptedSymKey === 'string'
      ? encryptedSymKey
      : ethers.hexlify(encryptedSymKey);

    // Call the contract method
    const tx = await this.contract.sendCode(id, symKey);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Confirm that the product was received successfully
   * @param id - Product ID
   * @returns Transaction receipt
   */
  public async confirmCompleted(id: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Call the contract method
    const tx = await this.contract.confirmCompleted(id);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Refund the buyer (can only be called by the seller)
   * @param id - Product ID
   * @returns Transaction receipt
   */
  public async refundBuyer(id: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Call the contract method
    const tx = await this.contract.refundBuyer(id);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Withdraw funds to the seller
   * @param id - Product ID
   * @returns Transaction receipt
   */
  public async withdrawSeller(id: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Call the contract method
    const tx = await this.contract.withdrawSeller(id);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Withdraw funds to the seller after confirmation timeout
   * @param id - Product ID
   * @returns Transaction receipt
   */
  public async withdrawSellerAfterConfirmTimeout(id: number): Promise<string> {
    if (!this.signer) {
      throw new Error('Signer required for write operations');
    }

    // Call the contract method
    const tx = await this.contract.withdrawSellerAfterConfirmTimeout(id);

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  }

  /**
   * Get product details
   * @param id - Product ID
   * @returns Product details
   */
  public async getProduct(id: number): Promise<any> {
    const product = await this.contract.products(id);
    return {
      seller: product.seller,
      price: product.price,
      currency: product.currency,
      status: product.status,
      fileId: product.fileId,
      buyer: product.buyer,
      sellerPubKey: product.sellerPubKey,
      buyerPubKey: product.buyerPubKey,
      encryptedSymKey: product.encryptedSymKey,
      sendCodeWindow: product.sendCodeWindow,
      confirmWindow: product.confirmWindow,
      paidAt: product.paidAt,
      codeSentAt: product.codeSentAt
    };
  }

  /**
   * Get the next product ID
   * @returns Next product ID
   */
  public async getNextId(): Promise<number> {
    const nextId = await this.contract.nextId();
    return Number(nextId);
  }

  /**
   * Get the default confirmation window
   * @returns Default confirmation window in seconds
   */
  public async getDefaultConfirmWindow(): Promise<number> {
    const window = await this.contract.DEFAULT_CONFIRM_WINDOW();
    return Number(window);
  }

  /**
   * Get the default send code window
   * @returns Default send code window in seconds
   */
  public async getDefaultSendCodeWindow(): Promise<number> {
    const window = await this.contract.DEFAULT_SEND_CODE_WINDOW();
    return Number(window);
  }
}

export default PayUnlockContract;
