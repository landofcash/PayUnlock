import { useState } from "react";
import { Layout } from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Key, Bug, AlertCircle, Lock, Unlock } from "lucide-react";
import { getCurrentConfig, signPrefix } from "@/config";
import { decryptAES, decryptWithECIES } from "@/utils/encryption";
import { generateKeyPair } from "@/utils/keygen";

export function DecryptDebugPage() {
  // State for form inputs
  const [seed, setSeed] = useState("");
  const [encryptedKey, setEncryptedKey] = useState("");
  const [encryptedData, setEncryptedData] = useState("");

  // State for results
  const [privateKey, setPrivateKey] = useState("");
  const [decryptedData, setDecryptedData] = useState("");

  // State for UI
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"idle" | "keyGenerated" | "keyDecrypted" | "dataDecrypted">("idle");

  const handleDecrypt = async () => {
    if (!seed.trim() || !encryptedKey.trim() || !encryptedData.trim()) {
      setError("Please fill in all fields");
      return;
    }

    setIsProcessing(true);
    setError("");
    setDecryptedData("");
    setPrivateKey("");
    setStep("idle");

    try {
      // Step 1: Generate key pair from seed
      const formattedSeed = signPrefix + seed;
      const seedBuffer = new TextEncoder().encode(formattedSeed);
      const keyPair = await generateKeyPair(seedBuffer);

      setPrivateKey(keyPair.privateKey);
      setStep("keyGenerated");

      // Step 2: Decrypt the symmetric key using the private key
      const aesKey = await decryptWithECIES(keyPair.privateKey, encryptedKey);
      setStep("keyDecrypted");

      // Step 3: Decrypt the data using the symmetric key
      const decrypted = await decryptAES(aesKey, encryptedData);
      setDecryptedData(decrypted);
      setStep("dataDecrypted");

    } catch (err: any) {
      console.error("Decryption error:", err);
      setError(`Decryption failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const loadSampleData = () => {
    // This would be replaced with actual sample data if available
    setSeed("sample-seed");
    setEncryptedKey("sample-encrypted-key");
    setEncryptedData("sample-encrypted-data");
    setError("");
    setDecryptedData("");
    setPrivateKey("");
    setStep("idle");
  };

  const clearAll = () => {
    setSeed("");
    setEncryptedKey("");
    setEncryptedData("");
    setDecryptedData("");
    setPrivateKey("");
    setError("");
    setStep("idle");
  };

  const config = getCurrentConfig();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bug className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Decryption Debug</h1>
          </div>
          <p className="text-muted-foreground">
            Test decryption functionality on {config.name}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6 flex space-x-2">
          <Button
            variant="outline"
            onClick={loadSampleData}
          >
            Load Sample
          </Button>
          <Button
            variant="ghost"
            onClick={clearAll}
          >
            Clear All
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Decrypt Data</span>
            </CardTitle>
            <CardDescription>
              Decrypt data using a seed, encrypted symmetric key, and encrypted data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="seed">Seed</Label>
              <Input
                id="seed"
                placeholder="Enter the seed used for encryption..."
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                The seed is used to generate the key pair for decryption
              </p>
            </div>

            <div>
              <Label htmlFor="encrypted-key">Encrypted Symmetric Key (Base64)</Label>
              <Textarea
                id="encrypted-key"
                placeholder="Enter the encrypted symmetric key..."
                value={encryptedKey}
                onChange={(e) => setEncryptedKey(e.target.value)}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="encrypted-data">Encrypted Data (Base64)</Label>
              <Textarea
                id="encrypted-data"
                placeholder="Enter the encrypted data..."
                value={encryptedData}
                onChange={(e) => setEncryptedData(e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: base64_iv:base64_ciphertext
              </p>
            </div>

            <Button
              onClick={handleDecrypt}
              disabled={isProcessing || !seed.trim() || !encryptedKey.trim() || !encryptedData.trim()}
              className="w-full"
            >
              {isProcessing ? "Decrypting..." : "Decrypt Data"}
            </Button>

            {privateKey && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Private Key (Base64)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(privateKey)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={privateKey}
                  readOnly
                  rows={2}
                  className="font-mono text-xs bg-blue-50 border-blue-200"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {step === "keyGenerated" && "Private key generated from seed"}
                  {step === "keyDecrypted" && "Private key used to decrypt symmetric key"}
                  {step === "dataDecrypted" && "Private key used to decrypt symmetric key"}
                </p>
              </div>
            )}

            {decryptedData && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Decrypted Data</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(decryptedData)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={decryptedData}
                  readOnly
                  rows={6}
                  className="font-mono text-xs bg-green-50 border-green-200"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>Decryption Process</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p className={step === "keyGenerated" || step === "keyDecrypted" || step === "dataDecrypted" ? "text-green-600 font-medium" : ""}>
                • Step 1: Generate key pair from seed
              </p>
              <p className={step === "keyDecrypted" || step === "dataDecrypted" ? "text-green-600 font-medium" : ""}>
                • Step 2: Decrypt symmetric key using private key
              </p>
              <p className={step === "dataDecrypted" ? "text-green-600 font-medium" : ""}>
                • Step 3: Decrypt data using symmetric key
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center space-x-2">
              <Bug className="w-4 h-4" />
              <span>Debug Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Network: {config.name} ({config.networkId})</p>
              <p>• Seed Prefix: {signPrefix}</p>
              <p>• Encryption Method: ECIES (secp256k1) + AES-GCM</p>
              <p>• Environment: Debug/Development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
