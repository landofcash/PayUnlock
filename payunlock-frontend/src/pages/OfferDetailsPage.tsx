import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProductStatusBadge } from "../components/ProductStatusBadge";
import { useState, useEffect } from "react";
import { usePublicClient, useWalletClient, useAccount, useSignMessage } from "wagmi";
import { formatUnits, parseUnits, encodeFunctionData, toHex } from "viem";
import PayUnlockABI from "@/contracts/PayUnlock.sol/PayUnlock.json";
import { getCurrentConfig } from "@/config";
import { useAppKit } from "@reown/appkit/react";
import { ShoppingCart, ChevronDown, ChevronUp } from "lucide-react";
import { b64FromBytes } from "@/utils/encoding";
import { generateKeyPairFromB64, getEncryptionSeed } from "@/utils/keygen";



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
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [buyerKeyPair, setBuyerKeyPair] = useState<{ privateKey: string, publicKey: string } | null>(null);
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
      const data = await response.json();
      return data;
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
        const formattedSeller = seller.substring(0, 6) + "..." + seller.substring(seller.length - 4);

        // Prepare buyer information if product is paid
        let buyerInfo: { buyer?: string; buyerPublicKey?: string; paidAt?: Date } = {};
        console.log("buyer:",buyer, "buyerPubKey:",buyerPubKey, "paidAt:",paidAt);
        if (status === 1) { // Product is paid
          buyerInfo = {
            buyer: buyer ? `${buyer.substring(0, 6)}...${buyer.substring(buyer.length - 4)}` : undefined,
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
          seller: formattedSeller,
          fileId,
          status,
          currency,
          sellerPubKey: sellerPubKey ? Buffer.from(sellerPubKey.slice(2), 'hex').toString() : undefined,
          encryptedSymKey: encryptedSymKey ? Buffer.from(encryptedSymKey.slice(2), 'hex').toString() : undefined,
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
                      disabled={isPurchasing || !isConnected}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-green-500 shadow-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Buy</span>
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
                      disabled={isPurchasing || !isConnected}
                      className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-primary/20 shadow-sm"
                    >
                      {!isConnected ? "Connect Wallet to Purchase" :
                       isPurchasing ? "Processing Purchase..." : "Purchase Now"}
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
    </Layout>
  );
}
