import {useEffect, useState} from "react";
import { Layout } from "../../components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, PenTool, Bug, AlertCircle } from "lucide-react";
import { getCurrentConfig } from "@/config";
import { useWallet } from "@/contexts/WalletContext";
import { AccountId } from "@hashgraph/sdk";
import {b64FromBytes, getHash} from "@/utils/encoding.ts";

export function WalletSignDebugPage() {
  const { walletState, connector } = useWallet();
  const { accountId, isConnected } = walletState;

  const [dataToSign, setDataToSign] = useState("");
  const [signature, setSignature] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState("");
  const [bufferTest, setBufferTest] = useState("");


  const signData = async () => {
    if (!connector || !isConnected) {
      setError("Wallet not connected");
      return;
    }

    if (!dataToSign.trim()) {
      setError("Please enter data to sign");
      return;
    }

    setIsSigning(true);
    setError("");
    setSignature("");

    try {
      // Convert string to bytes for signing
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(dataToSign);

      // Convert string accountId to AccountId object
      const hederaAccountId = AccountId.fromString(accountId!);

      // Get the signer for this account
      const signer = connector.getSigner(hederaAccountId);


      const signResult = await signer.sign([dataBytes]);
      setSignature(b64FromBytes(signResult[0].signature));

    } catch (err: any) {
      console.error("Signing error:", err);
      setError(`Signing failed: ${err.message}`);
    } finally {
      setIsSigning(false);
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
    setDataToSign("Hello, this is a test message for signing!");
    setError("");
    setSignature("");
  };

  const clearAll = () => {
    setDataToSign("");
    setSignature("");
    setError("");
  };

  useEffect(() => {
    getHash("test").then((x)=>setBufferTest(x));
  }, []);

  const config = getCurrentConfig();

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Bug className="w-8 h-8 text-orange-500" />
            <h1 className="text-3xl font-bold">Wallet Sign Debug</h1>
          </div>
          <p className="text-muted-foreground">
            Test wallet signing functionality on {config.name}
          </p>
        </div>

        {/* Connection Status */}
        <Alert className={`mb-6 ${isConnected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {isConnected ? (
              <span className="text-green-700">
                Wallet connected: {accountId}
              </span>
            ) : (
              <span className="text-orange-700">
                Please connect your wallet using the button in the header first
              </span>
            )}
          </AlertDescription>
        </Alert>

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
              <PenTool className="w-5 h-5" />
              <span>Sign Data</span>
            </CardTitle>
            <CardDescription>
              Sign arbitrary data with your connected Hedera wallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="data-to-sign">Data to Sign</Label>
              <Textarea
                id="data-to-sign"
                placeholder="Enter any text data you want to sign..."
                value={dataToSign}
                onChange={(e) => setDataToSign(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={signData}
              disabled={isSigning || !isConnected || !dataToSign.trim()}
              className="w-full"
            >
              {isSigning ? "Signing..." : "Sign Data"}
            </Button>

            {signature && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Signature (Hex)</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(signature)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <Textarea
                  value={signature}
                  readOnly
                  rows={4}
                  className="font-mono text-xs bg-green-50 border-green-200"
                />
              </div>
            )}
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
              <p>• Connected Account: {accountId || 'None'}</p>
              <p>• Signing Method: Hedera wallet native signing</p>
              <p>• Output Format: Hexadecimal string</p>
              <p>• Environment: Debug/Development</p>
              <p>{bufferTest}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
