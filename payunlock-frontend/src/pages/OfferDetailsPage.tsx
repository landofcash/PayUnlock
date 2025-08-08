import {Link, useParams} from "react-router-dom";
import {Layout} from "../components/Layout";
import {ProductStatusBadge} from "../components/ProductStatusBadge";
import {useEffect, useState} from "react";
import {useAccount, usePublicClient, useSignMessage, useWalletClient} from "wagmi";
import {encodeFunctionData, formatUnits, parseUnits, toHex} from "viem";
import PayUnlockABI from "@/contracts/PayUnlock.sol/PayUnlock.json";
import {getCurrentConfig} from "@/config";
import {useAppKit} from "@reown/appkit/react";
import {ChevronDown, ChevronUp, Key, ShoppingCart} from "lucide-react";
import {b64FromBytes} from "@/utils/encoding";
import {generateKeyPairFromB64, getEncryptionSeed} from "@/utils/keygen";
import {decryptAES, decryptWithECIES, encryptWithECIES} from "@/utils/encryption";


// Interface for product JSON data
interface ProductJsonData {
  name: string;
  description: string;
  tokenId: string;
  price: string;
  publicKey: string;
  createdAt: string;
  seller: string;
}

// Interface for product data
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  seller: string;
  fileId: string;
  status: number;
  currency: string;
  // Add buyer information fields
  buyer?: string;
  buyerPublicKey?: string;
  paidAt?: Date;
  // Additional product details
  sellerPubKey?: string;
  encryptedSymKey?: string;
  sendCodeWindow?: bigint;
  confirmWindow?: bigint;
}

export function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Buyer modal state
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [buyerKeyPair, setBuyerKeyPair] = useState<{ privateKey: string, publicKey: string } | null>(null);

  // Confirm modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmCurrentStep, setConfirmCurrentStep] = useState(0);
  const [isConfirmProcessing, setIsConfirmProcessing] = useState(false);
  const [isConfirmConfirming, setIsConfirmConfirming] = useState(false);
  const [isConfirmConfirmed, setIsConfirmConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [decryptedPayload, setDecryptedPayload] = useState<string | null>(null);

  // Seller modal state
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerCurrentStep, setSellerCurrentStep] = useState(0);
  const [isSellerProcessing, setIsSellerProcessing] = useState(false);
  const [isSellerConfirming, setIsSellerConfirming] = useState(false);
  const [isSellerConfirmed, setIsSellerConfirmed] = useState(false);
  const [sellerError, setSellerError] = useState<string | null>(null);
  const [encryptedSymKeyForBuyer, setEncryptedSymKeyForBuyer] = useState<string | null>(null);

  // State to control the expansion of the details section
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  const publicClient = usePublicClient();
  const walletClient = useWalletClient();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { open } = useAppKit();
  const config = getCurrentConfig();
  const contractAddress = config.contracts.payUnlock.address;

  // Method to load product JSON data
  const loadProductJSON = async (fileId: string): Promise<ProductJsonData | null> => {
    try {
      const response = await fetch(`https://algoosh.b-cdn.net/payunlock/${fileId}.json`);
      if (!response.ok) {
        console.warn(`Failed to load JSON for product ${fileId}: ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.warn(`Error loading JSON for product ${fileId}:`, error);
      return null;
    }
  };

  // Handle purchase button click - opens the modal
  const handlePurchase = () => {
    if (!product || !isConnected) {
      if (!isConnected) {
        open(); // Open wallet connection dialog
      }
      return;
    }

    // Reset modal state
    setCurrentStep(0);
    setBuyerKeyPair(null);
    setIsProcessing(false);
    setIsConfirming(false);
    setIsConfirmed(false);
    setPurchaseError(null);

    // Show the modal
    setShowModal(true);
  };

  // Handle seller send code button click - opens the seller modal
  const handleSellerSendCode = () => {
    if (!product || !isConnected || !address) {
      if (!isConnected) {
        open(); // Open wallet connection dialog
      }
      return;
    }

    // Reset seller modal state
    setSellerCurrentStep(0);
    setIsSellerProcessing(false);
    setIsSellerConfirming(false);
    setIsSellerConfirmed(false);
    setSellerError(null);
    setEncryptedSymKeyForBuyer(null);

    // Show the seller modal
    setShowSellerModal(true);
  };

  // Handle confirm button click - opens the confirm modal
  const handleConfirm = () => {
    if (!product || !isConnected || !address) {
      if (!isConnected) {
        open(); // Open wallet connection dialog
      }
      return;
    }

    // Reset confirm modal state
    setConfirmCurrentStep(0);
    setBuyerKeyPair(null);
    setIsConfirmProcessing(false);
    setIsConfirmConfirming(false);
    setIsConfirmConfirmed(false);
    setConfirmError(null);
    setDecryptedPayload(null);

    // Show the confirm modal
    setShowConfirmModal(true);
  };

  // Step 1 for confirm: Sign the seed, derive ECIES key pair, decrypt symmetric key, decrypt payload
  const handleConfirmSignAndDecrypt = async () => {
    if (!product || !isConnected || !product.encryptedSymKey) {
      setConfirmError("Missing product data or encrypted symmetric key");
      return;
    }

    setIsConfirmProcessing(true);
    setConfirmError(null);
    setConfirmCurrentStep(1);

    try {
      // Create message to sign using the product's fileId as the seed
      const seedMessage = getEncryptionSeed(product.fileId);

      // Sign message with wagmi
      const signature = await signMessageAsync({
        message: seedMessage,
      });

      if (!signature) {
        throw new Error("Failed to sign message");
      }

      // Convert hex signature to base64
      const signatureBytes = new Uint8Array(
        signature.slice(2).match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      const signatureBase64 = b64FromBytes(signatureBytes);

      // Generate key pair from signature
      const keyPair = await generateKeyPairFromB64(signatureBase64);

      // Store the key pair
      setBuyerKeyPair(keyPair);

      // Decrypt the symmetric key using the buyer's private key
      const symmetricKey = await decryptWithECIES(keyPair.privateKey, product.encryptedSymKey);

      // Fetch the encrypted product data from the CDN
      const response = await fetch(`https://algoosh.b-cdn.net/payunlock/${product.fileId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch product data: ${response.status}`);
      }

      const productData = await response.json();
      if (!productData.encryptedPayload) {
        throw new Error("No encrypted payload found in product data");
      }

      // Decrypt the payload using the symmetric key
      const decryptedContent = await decryptAES(symmetricKey, productData.encryptedPayload);

      // Store the decrypted payload
      setDecryptedPayload(decryptedContent);

      // Move to next step
      setConfirmCurrentStep(2);
    } catch (err: any) {
      console.error("Decryption error:", err);
      setConfirmError(`Decryption failed: ${err.message}`);
    } finally {
      setIsConfirmProcessing(false);
    }
  };

  // Step 2 for confirm: Call the smart contract method confirmCompleted with the order ID
  const handleConfirmCompleted = async () => {
    if (!product || !isConnected || !walletClient.data || !address || !publicClient) {
      setConfirmError("Missing required data. Please complete Step 1 first.");
      return;
    }

    setIsConfirmProcessing(true);
    setIsConfirmConfirming(true);
    setConfirmError(null);

    try {
      // Parse the product ID
      const productId = parseInt(product.id);

      console.log("Calling confirmCompleted with productId:", productId);

      // Encode the function call
      const data = encodeFunctionData({
        abi: PayUnlockABI.abi,
        functionName: 'confirmCompleted',
        args: [productId],
      });

      // Simulate the transaction first to check for errors
      try {
        const result = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: PayUnlockABI.abi,
          functionName: 'confirmCompleted',
          args: [productId],
          account: address as `0x${string}`,
        });
        console.log(`✅ Simulation successful ${JSON.stringify(result, null, 2) || 'No result returned'}`);
      } catch (simError: any) {
        console.log(`❌ Simulation failed: ${simError.shortMessage || simError.message}`);
        throw simError;
      }

      // Send the transaction
      const hash = await walletClient.data.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      });

      console.log(`Transaction sent: ${hash}`);

      // Wait for the transaction to be confirmed
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setIsConfirmConfirmed(true);
        console.log("Order confirmed successfully!");

        // Wait a moment before closing the modal and refreshing
        setTimeout(() => {
          setShowConfirmModal(false);
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error("Confirmation error:", err);
      // Provide more specific error messages based on the error type
      if (err.name === 'ContractFunctionExecutionError') {
        setConfirmError(`Smart contract error: ${err.shortMessage || err.message}`);
      } else if (err.name === 'UserRejectedRequestError') {
        setConfirmError("Transaction was rejected by user");
      } else {
        setConfirmError(`Confirmation failed: ${err.message}`);
      }
    } finally {
      setIsConfirmProcessing(false);
      setIsConfirmConfirming(false);
    }
  };

  // Step 1 for seller: Sign the seed, derive ECIES key pair, decrypt symmetric key, encrypt with buyer's public key
  const handleSellerSignAndEncrypt = async () => {
    if (!product || !isConnected || !product.buyerPublicKey) {
      setSellerError("Missing product data or buyer public key");
      return;
    }

    setIsSellerProcessing(true);
    setSellerError(null);
    setSellerCurrentStep(1);

    try {
      // Create message to sign using the product's fileId as the seed
      const seedMessage = getEncryptionSeed(product.fileId);

      // Sign message with wagmi
      const signature = await signMessageAsync({
        message: seedMessage,
      });

      if (!signature) {
        throw new Error("Failed to sign message");
      }

      // Convert hex signature to base64
      const signatureBytes = new Uint8Array(
        signature.slice(2).match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      const signatureBase64 = b64FromBytes(signatureBytes);

      // Generate key pair from signature
      const keyPair = await generateKeyPairFromB64(signatureBase64);

      // Get the encrypted symmetric key from the product
      if (!product.sellerPubKey) {
        throw new Error("Seller public key not found in product data");
      }

      // Check if we have an encrypted symmetric key stored in the product
      if (!product.encryptedSymKey) {
        // This is a special case where we need to create a new symmetric key
        // For this implementation, we'll throw an error as this should not happen
        throw new Error("No encrypted symmetric key found in product data");
      }

      // Decrypt the symmetric key using the seller's private key
      const symmetricKey = await decryptWithECIES(keyPair.privateKey, product.encryptedSymKey);

      // Encrypt the symmetric key with the buyer's public key
      const encryptedKeyForBuyer = await encryptWithECIES(product.buyerPublicKey, symmetricKey);

      // Store the encrypted key for the buyer
      setEncryptedSymKeyForBuyer(encryptedKeyForBuyer);

      // Move to next step
      setSellerCurrentStep(2);
    } catch (err: any) {
      console.error("Signing and encryption error:", err);
      setSellerError(`Process failed: ${err.message}`);
    } finally {
      setIsSellerProcessing(false);
    }
  };

  // Step 2 for seller: Call the smart contract method sendCode with the order ID and encrypted symmetric key
  const handleSellerSendCodeToBlockchain = async () => {
    if (!product || !isConnected || !walletClient.data || !address || !publicClient || !encryptedSymKeyForBuyer) {
      setSellerError("Missing required data. Please complete Step 1 first.");
      return;
    }

    setIsSellerProcessing(true);
    setIsSellerConfirming(true);
    setSellerError(null);

    try {
      // Parse the product ID
      const productId = parseInt(product.id);

      // Convert the encrypted symmetric key to hex format for the blockchain
      const encryptedKeyHex = toHex(Buffer.from(encryptedSymKeyForBuyer, 'base64'));

      console.log("Calling sendCode with productId:", productId, "encryptedKeyHex:", encryptedKeyHex);

      // Encode the function call
      const data = encodeFunctionData({
        abi: PayUnlockABI.abi,
        functionName: 'sendCode',
        args: [productId, encryptedKeyHex],
      });

      // Simulate the transaction first to check for errors
      try {
        const result = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: PayUnlockABI.abi,
          functionName: 'sendCode',
          args: [productId, encryptedKeyHex],
          account: address as `0x${string}`,
        });
        console.log(`✅ Simulation successful ${JSON.stringify(result, null, 2) || 'No result returned'}`);
      } catch (simError: any) {
        console.log(`❌ Simulation failed: ${simError.shortMessage || simError.message}`);
        throw simError;
      }

      // Send the transaction
      const hash = await walletClient.data.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
      });

      console.log(`Transaction sent: ${hash}`);

      // Wait for the transaction to be confirmed
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setIsSellerConfirmed(true);
        console.log("Access code sent successfully!");

        // Wait a moment before closing the modal and refreshing
        setTimeout(() => {
          setShowSellerModal(false);
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error("Send code error:", err);
      // Provide more specific error messages based on the error type
      if (err.name === 'ContractFunctionExecutionError') {
        setSellerError(`Smart contract error: ${err.shortMessage || err.message}`);
      } else if (err.name === 'UserRejectedRequestError') {
        setSellerError("Transaction was rejected by user");
      } else {
        setSellerError(`Send code failed: ${err.message}`);
      }
    } finally {
      setIsSellerProcessing(false);
      setIsSellerConfirming(false);
    }
  };

  // Step 1: Sign the product seed and derive ECIES key pair
  const handleSignAndDeriveKeys = async () => {
    if (!product || !isConnected) {
      setPurchaseError("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    setPurchaseError(null);
    setCurrentStep(1);

    try {
      // Create message to sign using the product's fileId as the seed
      const seedMessage = getEncryptionSeed(product.fileId);

      // Sign message with wagmi
      const signature = await signMessageAsync({
        message: seedMessage,
      });

      if (!signature) {
        throw new Error("Failed to sign message");
      }

      // Convert hex signature to base64
      const signatureBytes = new Uint8Array(
        signature.slice(2).match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      );
      const signatureBase64 = b64FromBytes(signatureBytes);

      // Generate key pair from signature
      const keyPair = await generateKeyPairFromB64(signatureBase64);

      // Store the key pair
      setBuyerKeyPair(keyPair);

      // Move to next step
      setCurrentStep(2);
    } catch (err: any) {
      console.error("Signing error:", err);
      setPurchaseError(`Signing failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Call the smart contract method
  const handleBlockchainPurchase = async () => {
    if (!product || !isConnected || !walletClient.data || !address || !publicClient || !buyerKeyPair) {
      setPurchaseError("Missing required data. Please complete Step 1 first.");
      return;
    }

    setIsProcessing(true);
    setIsConfirming(true);
    setPurchaseError(null);

    try {
      // Parse the product ID
      const productId = parseInt(product.id);

      // Get the raw price from the product (convert from formatted string back to bigint)
      const decimals = product.currency === "0x0000000000000000000000000000000000000000" ? 8 : 18;
      const priceInWei = parseUnits(product.price, decimals);

      // Determine which function to call based on the currency
      const isHBAR = product.currency === "0x0000000000000000000000000000000000000000";
      const functionName = isHBAR ? 'buyWithHBAR' : 'buyWithERC20';

      console.log("Calling function:", functionName, "priceInWei:",priceInWei, "productId:", productId);

      const args = [productId, priceInWei, toHex(buyerKeyPair.publicKey)];
      const data = encodeFunctionData({
        abi: PayUnlockABI.abi,
        functionName: functionName,
        args: args,
      });

      try {
        const result = await publicClient.simulateContract({
          address: contractAddress as `0x${string}`,
          abi: PayUnlockABI.abi,
          functionName: functionName,
          args: args,
          account: address as `0x${string}`,
          value: isHBAR ? priceInWei * (10n ** 10n) : 0n,
        });
        console.log(`✅ Simulation successful ${JSON.stringify(result, null, 2) || 'No result returned'}`);
      } catch (simError: any) {
        console.log(`❌ Simulation failed: ${simError.shortMessage || simError.message}`);

        // Check if it's a function selector issue
        if (simError.message.includes('function selector')) {
          console.log(`🚨 Function selector mismatch - wrong ABI or contract!`);
        }
      }

      // Send the transaction
      const hash = await walletClient.data.sendTransaction({
        to: contractAddress as `0x${string}`,
        data,
        value: isHBAR ? priceInWei * (10n ** 10n) : 0n, // Only send value if using HBAR
      });

      console.log(`Transaction sent: ${hash}`);

      // Wait for the transaction to be confirmed
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setIsConfirmed(true);
        console.log("Product purchased successfully!");

        // Wait a moment before closing the modal and refreshing
        setTimeout(() => {
          setShowModal(false);
          window.location.reload();
        }, 2000);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error("Purchase error:", err);
      // Provide more specific error messages based on the error type
      if (err.name === 'ContractFunctionExecutionError') {
        setPurchaseError(`Smart contract error: ${err.shortMessage || err.message}`);
      } else if (err.name === 'InsufficientFundsError') {
        setPurchaseError("Insufficient funds to complete this transaction");
      } else if (err.name === 'UserRejectedRequestError') {
        setPurchaseError("Transaction was rejected by user");
      } else {
        setPurchaseError(`Purchase failed: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!publicClient || !id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Parse the ID to ensure it's a number
        const productId = parseInt(id);
        if (isNaN(productId)) {
          throw new Error("Invalid product ID");
        }

        // Fetch the product from blockchain
        const productData = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: PayUnlockABI.abi,
          functionName: 'products',
          args: [productId],
        }) as any;

        // Extract product data from blockchain
        const [seller, price, currency, status, fileId, buyer,sellerPubKey, buyerPubKey,encryptedSymKey,sendCodeWindow,confirmWindow, paidAt] = productData;

        // Load product JSON data
        const productJsonData = await loadProductJSON(fileId);


        // Use JSON data if available, otherwise fall back to placeholder data
        const name = productJsonData?.name || `Product ${productId}`;
        const description = productJsonData?.description || `Product with ID ${fileId}`;

        // Format the price (assuming 8 decimals for HBAR, 18 for other tokens)
        const decimals = currency === "0x0000000000000000000000000000000000000000" ? 8 : 18;
        const formattedPrice = formatUnits(price, decimals);

        // Prepare buyer information if product is paid
        let buyerInfo: { buyer?: string; buyerPublicKey?: string; paidAt?: Date } = {};
        console.log("buyer:",buyer, "buyerPubKey:",buyerPubKey, "paidAt:",paidAt);
        if (status > 0) { // Product is paid
          buyerInfo = {
            buyer: buyer ? buyer : undefined,
            buyerPublicKey: buyerPubKey ? Buffer.from(buyerPubKey.slice(2), 'hex').toString() : undefined,
            paidAt: paidAt ? new Date(Number(paidAt*1000n)) : undefined
          };
        }

        // Set the product data
        setProduct({
          id: productId.toString(),
          name,
          description,
          price: formattedPrice,
          seller: seller,
          fileId,
          status,
          currency,
          sellerPubKey: sellerPubKey ? Buffer.from(sellerPubKey.slice(2), 'hex').toString() : undefined,
          encryptedSymKey: encryptedSymKey ? b64FromBytes(Buffer.from(encryptedSymKey.slice(2), 'hex')) : undefined,
          sendCodeWindow,
          confirmWindow,
          ...buyerInfo
        });


      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to fetch product");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [publicClient, contractAddress, id]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/offers" className="text-primary hover:underline">
            &larr; Back to all offers
          </Link>
        </div>

        {isLoading && (
          <div className="text-center py-10">
            <p>Loading product details...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !error && !product && (
          <div className="text-center py-10">
            <p>Product not found.</p>
          </div>
        )}

        {!isLoading && !error && product && (
          <div className="bg-card rounded-lg shadow-lg overflow-hidden">
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <ProductStatusBadge status={product.status} />
              </div>

              <div className="flex flex-col md:flex-row md:justify-between mb-8">
                <div className="mb-4 md:mb-0">
                  <p className="text-muted-foreground text-xs">Order ID(seed): {product.id} ({product.fileId})</p>
                  <p className="text-muted-foreground text-xs">Seller: {product.seller}</p>
                  {product.status === 1 && product.buyer && (
                    <p className="text-muted-foreground text-xs">Buyer: {product.buyer}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-3xl font-bold border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {product.price} {product.currency === "0x0000000000000000000000000000000000000000" ? "hBar" : "tokens"}
                  </div>
                  {product.status === 0 && (
                    <button
                      onClick={handlePurchase}
                      disabled={!isConnected}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-green-500 shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy</span>
                    </button>
                  )}
                  {product.status === 1 && address && product.seller.toLowerCase() === address.toLowerCase() && (
                    <button
                      onClick={handleSellerSendCode}
                      disabled={isSellerProcessing || !isConnected}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-blue-500 shadow-sm"
                    >
                      <Key className="w-4 h-4" />
                      <span>Send Access Code</span>
                    </button>
                  )}
                  {product.status === 2 && address && product.buyer && address.toLowerCase() === product.buyer.toLowerCase() && product.encryptedSymKey && (
                    <button
                      onClick={handleConfirm}
                      disabled={isConfirmProcessing || !isConnected}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-green-500 shadow-sm mt-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>Confirm & View Content</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="mb-4">{product.description}</p>
              </div>

              <div className="mb-8">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
                >
                  <h2 className="text-xl font-semibold mb-2">Additional Details</h2>
                  <button
                    className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                    aria-label={isDetailsExpanded ? "Collapse details" : "Expand details"}
                  >
                    {isDetailsExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {isDetailsExpanded && (
                  <div className="bg-gray-50 p-3 rounded-md border border-gray-200 overflow-x-auto transition-all duration-300 ease-in-out">
                    <table className="w-full text-sm">
                      <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Connected Address:</td>
                        <td className="py-1 pl-3">{address}</td>
                      </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Order ID (Seed):</td>
                          <td className="py-1 pl-3">{product.id} ({product.fileId})</td>
                        </tr>
                        <tr className="border-b border-gray-200">
                          <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Seller:</td>
                          <td className="py-1 pl-3">{product.seller}</td>
                        </tr>
                        {product.status === 1 && product.buyer && (
                          <tr className="border-b border-gray-200">
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Buyer:</td>
                            <td className="py-1 pl-3">{product.buyer}</td>
                          </tr>
                        )}
                        {product.status === 1 && product.buyerPublicKey && (
                          <tr className="border-b border-gray-200">
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Buyer Public Key:</td>
                            <td className="py-1 pl-3 font-mono break-all">{product.buyerPublicKey}</td>
                          </tr>
                        )}
                        {product.status === 1 && product.paidAt && (
                          <tr className="border-b border-gray-200">
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Paid At:</td>
                            <td className="py-1 pl-3">{product.paidAt.toLocaleString()}</td>
                          </tr>
                        )}
                        {product.sellerPubKey && (
                          <tr className="border-b border-gray-200">
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Seller Public Key:</td>
                            <td className="py-1 pl-3 font-mono break-all">{product.sellerPubKey}</td>
                          </tr>
                        )}
                        {product.encryptedSymKey && (
                          <tr className="border-b border-gray-200">
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Encrypted Sym Key:</td>
                            <td className="py-1 pl-3 font-mono break-all">{product.encryptedSymKey}</td>
                          </tr>
                        )}
                        {product.sendCodeWindow && (
                          <tr className="border-b border-gray-200">
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Send Code Window:</td>
                            <td className="py-1 pl-3">{product.sendCodeWindow.toString()} seconds</td>
                          </tr>
                        )}
                        {product.confirmWindow && (
                          <tr>
                            <td className="py-1 pr-3 font-medium text-gray-700 whitespace-nowrap">Confirm Window:</td>
                            <td className="py-1 pl-3">{product.confirmWindow.toString()} seconds</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Purchase Flow</h2>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <p className="mb-2">This product uses a secure escrow-based purchase process:</p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>All content is encrypted to protect both buyers and sellers</li>
                    <li>When you purchase, your funds are securely held in an escrow account</li>
                    <li>The seller will encrypt the product specifically for your wallet</li>
                    <li>You'll be able to decrypt the content using your wallet</li>
                    <li>After verifying the content, you release the funds to the seller</li>
                  </ol>
                  <p className="mt-3 text-sm text-blue-700">This process ensures secure delivery and protects both parties in the transaction.</p>
                </div>
              </div>

              <div className="mt-8">
                {purchaseError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                    {purchaseError}
                  </div>
                )}

                {product.status === 0 && (
                  <>
                    <button
                      onClick={handlePurchase}
                      disabled={ !isConnected}
                      className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20 shadow-sm"
                    >
                      {!isConnected ? "Connect Wallet to Purchase" : "Purchase Now"}
                    </button>
                    <p className="text-center text-sm text-muted-foreground mt-2">
                      Secure payment with escrow protection
                    </p>
                  </>
                )}
                {product.status !== 0 && (
                  <div className="text-center py-3 bg-gray-100 rounded-md">
                    <p>This product is no longer available for purchase</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Purchase Product</h2>

            {purchaseError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {purchaseError}
              </div>
            )}

            <div className={`mb-4 ${currentStep === 1 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
              <h3 className="font-semibold mb-2">Step 1: Secure Your Purchase</h3>
              <p className="text-sm text-gray-600">
                • Sign a message to verify your identity<br/>
                • Generate secure keys for encrypted delivery<br/>
                • Prepare for secure transaction
              </p>
              {currentStep === 1 && isProcessing && (
                <div className="mt-2 text-blue-600 text-sm">Securing your purchase...</div>
              )}
              {currentStep > 1 && (
                <div className="mt-2 text-green-600 text-sm">✓ Purchase secured</div>
              )}
            </div>

            <div className={`mb-6 ${currentStep === 2 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
              <h3 className="font-semibold mb-2">Step 2: Complete Payment</h3>
              <p className="text-sm text-gray-600">
                • Send payment to the secure escrow contract<br/>
                • Register your purchase on the blockchain<br/>
                • Await confirmation from the network
              </p>
              {currentStep === 2 && isProcessing && (
                <div className="mt-2 text-blue-600 text-sm">Processing payment...</div>
              )}
              {currentStep === 2 && isConfirming && (
                <div className="mt-2 text-blue-600 text-sm">Confirming your purchase...</div>
              )}
              {isConfirmed && (
                <div className="mt-2 text-green-600 text-sm">✓ Payment successful!</div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setShowModal(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-3 hover:bg-gray-300 transition-colors font-medium"
                      disabled={isProcessing || isConfirming}>
                {isProcessing ? "Please Wait..." : "Cancel"}
              </button>
              {currentStep === 0 && (
                <button onClick={handleSignAndDeriveKeys}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                        disabled={isProcessing || !isConnected}>
                  Begin Purchase
                </button>
              )}
              {currentStep === 1 && (
                <button disabled={true}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md opacity-50 cursor-not-allowed font-medium">
                  Processing...
                </button>
              )}
              {currentStep === 2 && !isConfirmed && (
                <button onClick={handleBlockchainPurchase}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                        disabled={isProcessing || isConfirming}>
                  {isConfirming ? "Processing..." : "Complete Purchase"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Modal */}
      {showSellerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Send Access Code to Buyer</h2>

            {sellerError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {sellerError}
              </div>
            )}

            <div className={`mb-4 ${sellerCurrentStep === 1 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
              <h3 className="font-semibold mb-2">Step 1: Prepare Access Code</h3>
              <p className="text-sm text-gray-600">
                • Sign a message to verify your identity<br/>
                • Decrypt your symmetric key<br/>
                • Encrypt it with buyer's public key
              </p>
              {sellerCurrentStep === 1 && isSellerProcessing && (
                <div className="mt-2 text-blue-600 text-sm">Preparing access code...</div>
              )}
              {sellerCurrentStep > 1 && (
                <div className="mt-2 text-green-600 text-sm">✓ Access code prepared</div>
              )}
            </div>

            <div className={`mb-6 ${sellerCurrentStep === 2 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
              <h3 className="font-semibold mb-2">Step 2: Send to Buyer</h3>
              <p className="text-sm text-gray-600">
                • Send the encrypted access code to the blockchain<br/>
                • Make it available for the buyer to access<br/>
                • Complete the transaction
              </p>
              {sellerCurrentStep === 2 && isSellerProcessing && (
                <div className="mt-2 text-blue-600 text-sm">Sending access code...</div>
              )}
              {sellerCurrentStep === 2 && isSellerConfirming && (
                <div className="mt-2 text-blue-600 text-sm">Confirming transaction...</div>
              )}
              {isSellerConfirmed && (
                <div className="mt-2 text-green-600 text-sm">✓ Access code sent successfully!</div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => setShowSellerModal(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-3 hover:bg-gray-300 transition-colors font-medium"
                      disabled={isSellerProcessing || isSellerConfirming}>
                {isSellerProcessing ? "Please Wait..." : "Cancel"}
              </button>
              {sellerCurrentStep === 0 && (
                <button onClick={handleSellerSignAndEncrypt}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                        disabled={isSellerProcessing || !isConnected}>
                  Begin Process
                </button>
              )}
              {sellerCurrentStep === 1 && (
                <button disabled={true}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md opacity-50 cursor-not-allowed font-medium">
                  Processing...
                </button>
              )}
              {sellerCurrentStep === 2 && !isSellerConfirmed && (
                <button onClick={handleSellerSendCodeToBlockchain}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                        disabled={isSellerProcessing || isSellerConfirming}>
                  {isSellerConfirming ? "Processing..." : "Send Access Code"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm & View Content</h2>

            {confirmError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                {confirmError}
              </div>
            )}

            <div className={`mb-4 ${confirmCurrentStep === 1 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
              <h3 className="font-semibold mb-2">Step 1: Decrypt Content</h3>
              <p className="text-sm text-gray-600">
                • Sign a message to verify your identity<br/>
                • Derive your ECIES keypair<br/>
                • Decrypt the symmetric key<br/>
                • Decrypt the product content
              </p>
              {confirmCurrentStep === 1 && isConfirmProcessing && (
                <div className="mt-2 text-blue-600 text-sm">Decrypting content...</div>
              )}
              {confirmCurrentStep > 1 && (
                <div className="mt-2 text-green-600 text-sm">✓ Content decrypted</div>
              )}
            </div>

            <div className={`mb-6 ${confirmCurrentStep === 2 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
              <h3 className="font-semibold mb-2">Step 2: Confirm Receipt</h3>
              <p className="text-sm text-gray-600">
                • Confirm receipt of the product on the blockchain<br/>
                • Complete the transaction<br/>
                • Release payment to the seller
              </p>
              {confirmCurrentStep === 2 && isConfirmProcessing && (
                <div className="mt-2 text-blue-600 text-sm">Confirming receipt...</div>
              )}
              {confirmCurrentStep === 2 && isConfirmConfirming && (
                <div className="mt-2 text-blue-600 text-sm">Finalizing transaction...</div>
              )}
              {isConfirmConfirmed && (
                <div className="mt-2 text-green-600 text-sm">✓ Receipt confirmed successfully!</div>
              )}
            </div>

            {decryptedPayload && confirmCurrentStep > 1 && (
              <div className="mb-6 bg-gray-50 p-4 border border-gray-200 rounded-md">
                <h3 className="font-semibold mb-2">Product Content</h3>
                <div className="bg-white p-3 border border-gray-300 rounded-md max-h-40 overflow-y-auto">
                  <p className="whitespace-pre-wrap break-words">{decryptedPayload}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button onClick={() => setShowConfirmModal(false)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-3 hover:bg-gray-300 transition-colors font-medium"
                      disabled={isConfirmProcessing || isConfirmConfirming}>
                {isConfirmProcessing ? "Please Wait..." : "Close"}
              </button>
              {confirmCurrentStep === 0 && (
                <button onClick={handleConfirmSignAndDecrypt}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                        disabled={isConfirmProcessing || !isConnected}>
                  Begin Process
                </button>
              )}
              {confirmCurrentStep === 1 && (
                <button disabled={true}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md opacity-50 cursor-not-allowed font-medium">
                  Processing...
                </button>
              )}
              {confirmCurrentStep === 2 && !isConfirmConfirmed && (
                <button onClick={handleConfirmCompleted}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                        disabled={isConfirmProcessing || isConfirmConfirming}>
                  {isConfirmConfirming ? "Processing..." : "Confirm Receipt"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
