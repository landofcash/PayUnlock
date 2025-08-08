import {Layout} from "../components/Layout";
import {useState, useRef, useEffect} from "react";
import {getCurrentConfig} from "@/config";
import {b64FromBytes} from "@/utils/encoding";
import {generateKeyPairFromB64, getEncryptionSeed} from "@/utils/keygen";
import {generateAESKey, encryptWithECIES, encryptAES} from "@/utils/encryption";
import {encodeBase64Uuid} from "@/utils/uuidBase64.ts";
import {
  useAccount,
  useSignMessage,
  usePublicClient,
  useWalletClient
} from "wagmi";
import {useAppKit} from "@reown/appkit/react";
import {encodeFunctionData, parseUnits, toHex} from "viem";
import PayUnlockABI from "@/contracts/PayUnlock.sol/PayUnlock.json";


// Interface for product form data
interface ProductFormData {
  seed: string;
  name: string;
  description: string;
  tokenId: string;
  price: string;
  payload: string;
}

// Interface for encrypted product data
interface EncryptedProductData {
  seed: string;
  name: string;
  description: string;
  tokenId: string;
  price: string;
  encryptedPayload: string;
  encryptedKey: string;
  publicKey: string;
}

export function NewProductPage() {
  const seed = useRef(encodeBase64Uuid(crypto.randomUUID().toString()));

  // Wagmi hooks
  const {address, isConnected} = useAccount();
  const {signMessageAsync} = useSignMessage();
  const {open} = useAppKit();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    seed: seed.current,
    name: "",
    description: "",
    tokenId: "",
    price: "",
    payload: ""
  });
  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [encryptedData, setEncryptedData] = useState<EncryptedProductData | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // References to form elements
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const tokenRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const payloadRef = useRef<HTMLTextAreaElement>(null);

  // Get wallet and config
  const config = getCurrentConfig();

  // Get PayUnlock contract
  const contractAddress = config.contracts.payUnlock.address;

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {id, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      open();
      return;
    }

    // Collect form data
    const formData: ProductFormData = {
      seed: seed.current,
      name: nameRef.current?.value || "",
      description: descriptionRef.current?.value || "",
      tokenId: tokenRef.current?.value || "",
      price: priceRef.current?.value || "",
      payload: payloadRef.current?.value || ""
    };

    setFormData(formData);
    setShowModal(true);
  };

  // Step 1: Encryption process
  const handleEncryption = async () => {
    if (!address || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsProcessing(true);
    setError("");
    setCurrentStep(1);

    try {
      // Create message to sign
      const seedMessage = getEncryptionSeed(seed.current);

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

      const aesKey = await generateAESKey();
      const encryptedPayload = await encryptAES(aesKey, formData.payload);

      const keyPair = await generateKeyPairFromB64(signatureBase64);
      const encryptedKey = await encryptWithECIES(keyPair.publicKey, aesKey);

      const data = {
        seed: seed.current,
        name: formData.name,
        description: formData.description,
        tokenId: formData.tokenId,
        price: formData.price,
        encryptedPayload: encryptedPayload,
        encryptedKey: encryptedKey,
        publicKey: keyPair.publicKey
      }
      // Store encrypted data
      setEncryptedData(data);


      const res = await fetch(`${config.fileApiUrl}/json`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          path: `${seed.current}.json`,
          content: data,
        }),
      });
      if (!res.ok) throw new Error('JSON upload failed');

      setCurrentStep(2);
    } catch (err: any) {
      console.error("Encryption error:", err);
      setError(`Encryption failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Store on blockchain
  const handleBlockchainStorage = async () => {
    if (!encryptedData || !address) {
      setError("No encrypted data available or wallet not connected. Please complete Step 1 first.");
      return;
    }
    if(!walletClient.data || !publicClient) {
      setError("Wallet client not available. Please connect your wallet first.");
      return;
    }

    setIsProcessing(true);
    setIsConfirming(true);
    setError("");

    try {
      // Create a unique file ID for the product
      const fileId = `${seed.current}`;

      // Get the currency address (zero address for HBAR)
      const currency = encryptedData.tokenId === "0.0.0"
        ? "0x0000000000000000000000000000000000000000"
        : encryptedData.tokenId;

      // Parse price based on token decimals (assuming 18 decimals for most tokens, 8 for HBAR)
      const decimals = encryptedData.tokenId === "0.0.0" ? 8 : 18;
      const priceInWei = parseUnits(encryptedData.price, decimals);

      const data = encodeFunctionData({
        abi: PayUnlockABI.abi,
        functionName: 'createProduct',
        args: [
          fileId,
          priceInWei,
          currency,
          toHex(encryptedData.publicKey),
          toHex(encryptedData.encryptedKey),
          ],
      });

      console.log(`Sending transaction...`);
      const hash = await walletClient.data.sendTransaction({
        to: contractAddress as `0x${string}`,
        data
      });

      console.log(`Transaction sent: ${hash}`);
      console.log(`Waiting for confirmation...`);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction confirmed with status: ${receipt.status}`);
      console.log(`Gas used: ${receipt.gasUsed.toString()}`);

      if (receipt.status === 'success') {
        setIsConfirmed(true);
        console.log("Product created on blockchain successfully!");
        alert(`Product successfully created!`);
      } else {
        throw new Error('Transaction failed');
      }

    } catch (err: any) {
      console.error("Blockchain storage error:", err);
      // Provide more specific error messages based on the error type
      if (err.name === 'ContractFunctionExecutionError') {
        setError(`Smart contract error: ${err.shortMessage || err.message}`);
      } else if (err.name === 'InsufficientFundsError') {
        setError("Insufficient funds to complete this transaction");
      } else if (err.name === 'UserRejectedRequestError') {
        setError("Transaction was rejected by user");
      } else {
        setError(`Blockchain storage failed: ${err.message}`);
      }
    } finally {
      setIsProcessing(false);
      setIsConfirming(false);
    }
  };

  // Handle success state
  useEffect(() => {
    if (isConfirmed && encryptedData) {
      // Reset form and state after confirmation
      setShowModal(false);

      // Reset form
      if (nameRef.current) nameRef.current.value = "";
      if (descriptionRef.current) descriptionRef.current.value = "";
      if (tokenRef.current) tokenRef.current.value = config.supportedTokens[0].id;
      if (priceRef.current) priceRef.current.value = "";
      if (payloadRef.current) payloadRef.current.value = "";

      setFormData({
        seed: seed.current,
        name: "",
        description: "",
        tokenId: "",
        price: "",
        payload: ""
      });

      setEncryptedData(null);
      setCurrentStep(0);
      setIsProcessing(false);
      setIsConfirmed(false);
      setIsConfirming(false);
    }
  }, [isConfirmed, encryptedData, config.supportedTokens]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Sell Your Digital Product</h1>
        <p className="mb-8">Create a secure listing for your digital content with blockchain protection</p>

        <div className="bg-card rounded-lg shadow-md p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block mb-2 font-medium">
                Product Name
              </label>
              <input type="text" id="name" ref={nameRef} className="w-full p-2 border border-input rounded-md"
                     placeholder="e.g., Premium E-book, Software License, Digital Art" onChange={handleInputChange} required/>
              <p className="text-xs text-gray-500 mt-1">Choose a clear, descriptive name that helps buyers understand what you're selling</p>
            </div>

            <div>
              <label htmlFor="description" className="block mb-2 font-medium">
                Product Description
              </label>
              <textarea id="description" ref={descriptionRef} rows={4}
                        className="w-full p-2 border border-input rounded-md"
                        placeholder="Describe what buyers will receive, key features, and any important details..."
                        onChange={handleInputChange} required></textarea>
              <p className="text-xs text-gray-500 mt-1">A detailed description helps buyers make informed decisions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="token" className="block mb-2 font-medium">
                  Payment Currency
                </label>
                <select id="token" ref={tokenRef} className="w-full p-2 border border-input rounded-md"
                        onChange={handleInputChange} required>
                  {config.supportedTokens.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.name} ({token.symbol}) </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select which currency buyers will use to purchase</p>
              </div>

              <div>
                <label htmlFor="price" className="block mb-2 font-medium">
                  Price
                </label>
                <input type="number" id="price" ref={priceRef} className="w-full p-2 border border-input rounded-md"
                       placeholder="0.00" min="0" step="0.01" onChange={handleInputChange} required/>
                <p className="text-xs text-gray-500 mt-1">Set a competitive price in the selected currency</p>
              </div>
            </div>

            <div>
              <label htmlFor="payload" className="block mb-2 font-medium">
                Product Content
              </label>
              <textarea id="payload" ref={payloadRef} rows={4} className="w-full p-2 border border-input rounded-md"
                        placeholder="Enter the actual content buyers will receive (license key, download link, access code, etc.)"
                        onChange={handleInputChange}
                        required></textarea>
              <p className="text-xs text-gray-500 mt-1">This content will be securely encrypted and only revealed to buyers after purchase</p>
            </div>

            <div className="pt-4">
              <button type="submit"
                      className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-lg font-medium">
                {!isConnected ? "Connect Wallet to Continue" : "List Product for Sale"}
              </button>
            </div>
          </form>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Create Your Product</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className={`mb-4 ${currentStep === 1 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
                <h3 className="font-semibold mb-2">Step 1: Securing Your Content</h3>
                <p className="text-sm text-gray-600">
                  • Verify your ownership with a digital signature<br/>
                  • Generate secure keys to protect your content<br/>
                  • Encrypt your product data for customer safety<br/>
                  • Prepare your content for secure distribution</p>
                {currentStep === 1 && isProcessing && (
                  <div className="mt-2 text-blue-600 text-sm">Securing your content...</div>
                )}
                {currentStep > 1 && (
                  <div className="mt-2 text-green-600 text-sm">✓ Content secured</div>
                )}
              </div>

              <div className={`mb-6 ${currentStep === 2 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
                <h3 className="font-semibold mb-2">Step 2: Publishing Your Product</h3>
                <p className="text-sm text-gray-600">
                  • Register your product on the blockchain network<br/>
                  • Store product details securely for buyers to discover</p>
                {currentStep === 2 && isProcessing && (
                  <div className="mt-2 text-blue-600 text-sm">Publishing your product...</div>
                )}
                {currentStep === 2 && isConfirming && (
                  <div className="mt-2 text-blue-600 text-sm">Finalizing your product listing...</div>
                )}
                {isConfirmed && (
                  <div className="mt-2 text-green-600 text-sm">✓ Product successfully published!</div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={() => setShowModal(false)}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-3 hover:bg-gray-300 transition-colors font-medium"
                        disabled={isProcessing || isConfirming}>
                  {isProcessing ? "Please Wait..." : "Cancel"}
                </button>
                {currentStep === 0 && (
                  <button onClick={handleEncryption}
                          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                          disabled={isProcessing || !isConnected}>
                    Begin Listing </button>
                )}
                {currentStep === 1 && (
                  <button disabled={true}
                          className="bg-primary text-primary-foreground px-6 py-2 rounded-md opacity-50 cursor-not-allowed font-medium">
                    Processing... </button>
                )}
                {currentStep === 2 && !isConfirmed && (
                  <button onClick={handleBlockchainStorage}
                          className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium"
                          disabled={isProcessing || isConfirming}>
                    {isConfirming ? "Publishing..." : "Publish Product"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
