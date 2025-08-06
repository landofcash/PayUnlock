import { Layout } from "../components/Layout";
import { useState, useRef } from "react";
import { getCurrentConfig } from "@/config";
import { useWallet } from "@/contexts/WalletContext";
import { AccountId } from "@hashgraph/sdk";
import { b64FromBytes } from "@/utils/encoding";
import { generateKeyPairFromB64, getEncryptionSeed } from "@/utils/keygen";
import {generateAESKey, encryptWithECIES, encryptAES} from "@/utils/encryption";
import {encodeBase64Uuid} from "@/utils/uuidBase64.ts";

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

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    seed: seed.current,
    name: "",
    description: "",
    tokenId: "",
    price: "",
    payload: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [encryptedData, setEncryptedData] = useState<EncryptedProductData | null>(null);

  // References to form elements
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const tokenRef = useRef<HTMLSelectElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const payloadRef = useRef<HTMLTextAreaElement>(null);

  // Get wallet and config
  const { walletState, connector } = useWallet();
  const { accountId, isConnected } = walletState;
  const config = getCurrentConfig();

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Collect form data
    const formData: ProductFormData = {
      seed:seed.current,
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
    if (!connector || !isConnected) {
      setError("Wallet not connected. Please connect your wallet first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setCurrentStep(1);

    try {
      const encoder = new TextEncoder();
      const seedBytes = encoder.encode(getEncryptionSeed(seed.current));
      const hederaAccountId = AccountId.fromString(accountId!);
      const signer = connector.getSigner(hederaAccountId);
      const signResult = await signer.sign([seedBytes]);
      const signature = signResult[0].signature;
      const signatureBase64 = b64FromBytes(signature);
      const aesKey = await generateAESKey();
      const encryptedPayload= await encryptAES(aesKey,formData.payload);

      const keyPair = await generateKeyPairFromB64(signatureBase64);
      const encryptedKey = await encryptWithECIES(keyPair.publicKey, aesKey);

      // Store encrypted data
      setEncryptedData({
        seed:seed.current,
        name: formData.name,
        description: formData.description,
        tokenId: formData.tokenId,
        price: formData.price,
        encryptedPayload: encryptedPayload,
        encryptedKey: encryptedKey,
        publicKey: keyPair.publicKey
      });

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
    if (!encryptedData) {
      setError("No encrypted data available. Please complete Step 1 first.");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // This would be implemented with actual smart contract calls
      // For now, we'll just simulate the process
      console.log("Storing product data on blockchain:", encryptedData);

      // Create metadata JSON that would be stored in Hedera file
      const metadata = {
        name: encryptedData.name,
        description: encryptedData.description,
        tokenId: encryptedData.tokenId,
        price: encryptedData.price,
        publicKey: encryptedData.publicKey,
        createdAt: new Date().toISOString(),
        seller: accountId
      };

      console.log("Product metadata to be stored:", metadata);

      // Simulate blockchain storage delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Success - would redirect to product page or show success message
      alert("Product successfully created and stored on blockchain!");
      setShowModal(false);

      // Reset form and state
      if (nameRef.current) nameRef.current.value = "";
      if (descriptionRef.current) descriptionRef.current.value = "";
      if (tokenRef.current) tokenRef.current.value = config.supportedTokens[0].id;
      if (priceRef.current) priceRef.current.value = "";
      if (payloadRef.current) payloadRef.current.value = "";

      setFormData({
        seed:seed.current,
        name: "",
        description: "",
        tokenId: "",
        price: "",
        payload: ""
      });

      setEncryptedData(null);
      setCurrentStep(0);

    } catch (err: any) {
      console.error("Blockchain storage error:", err);
      setError(`Blockchain storage failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Product</h1>
        <p className="mb-8">List your digital product securely with blockchain protection</p>

        <div className="bg-card rounded-lg shadow-md p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block mb-2">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                ref={nameRef}
                className="w-full p-2 border border-input rounded-md"
                placeholder="e.g., Windows 11 Pro License"
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2">
                Description
              </label>
              <textarea
                id="description"
                ref={descriptionRef}
                rows={4}
                className="w-full p-2 border border-input rounded-md"
                placeholder="Provide detailed information about your digital product..."
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="token" className="block mb-2">
                  Token
                </label>
                <select
                  id="token"
                  ref={tokenRef}
                  className="w-full p-2 border border-input rounded-md"
                  onChange={handleInputChange}
                  required
                >
                  {config.supportedTokens.map((token) => (
                    <option key={token.id} value={token.id}>
                      {token.name} ({token.symbol})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block mb-2">
                  Price
                </label>
                <input
                  type="number"
                  id="price"
                  ref={priceRef}
                  className="w-full p-2 border border-input rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="payload" className="block mb-2">
                Payload
              </label>
              <textarea
                id="payload"
                ref={payloadRef}
                rows={4}
                className="w-full p-2 border border-input rounded-md"
                placeholder="Enter the payload content that will be encrypted..."
                onChange={handleInputChange}
                required
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Next Steps</h2>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className={`mb-4 ${currentStep === 1 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
                <h3 className="font-semibold mb-2">Step 1: Encryption</h3>
                <p className="text-sm text-gray-600">
                  • Sign the product seed with your wallet<br />
                  • Create ECIES key pair derived from the signature<br />
                  • Create new AES key<br />
                  • Encrypt payload with AES<br />
                  • Encrypt key with ECIES
                </p>
                {currentStep === 1 && isProcessing && (
                  <div className="mt-2 text-blue-600 text-sm">Processing...</div>
                )}
                {currentStep > 1 && (
                  <div className="mt-2 text-green-600 text-sm">✓ Completed</div>
                )}
              </div>

              <div className={`mb-6 ${currentStep === 2 ? 'bg-blue-50 p-3 border border-blue-200 rounded-md' : ''}`}>
                <h3 className="font-semibold mb-2">Step 2: Blockchain Storage</h3>
                <p className="text-sm text-gray-600">
                  • Call smart contract to store the product data on chain<br />
                  • Product metadata will be stored in Hedera file as JSON
                </p>
                {currentStep === 2 && isProcessing && (
                  <div className="mt-2 text-blue-600 text-sm">Processing...</div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                {currentStep === 0 && (
                  <button
                    onClick={handleEncryption}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    disabled={isProcessing || !isConnected}
                  >
                    Start Process
                  </button>
                )}
                {currentStep === 1 && (
                  <button
                    disabled={true}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
                  >
                    Proceed
                  </button>
                )}
                {currentStep === 2 && (
                  <button
                    onClick={handleBlockchainStorage}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    disabled={isProcessing}
                  >
                    Store on Blockchain
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
