import { useState } from "react";
import { Layout } from "../components/Layout";

export function VerifyPage() {
  const [file, setFile] = useState<File | null>(null);
  const [providedHash, setProvidedHash] = useState("");
  const [calculatedHash, setCalculatedHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<"success" | "failure" | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // This would typically use a real hash calculation function
  const simulateHashVerification = () => {
    setIsVerifying(true);

    // Simulate API call or calculation delay
    setTimeout(() => {
      // For demo purposes, we'll generate a mock hash
      const mockHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      setCalculatedHash(mockHash);

      // Compare with provided hash (case-insensitive)
      if (providedHash.toLowerCase() === mockHash.toLowerCase()) {
        setVerificationResult("success");
      } else {
        setVerificationResult("failure");
      }

      setIsVerifying(false);
    }, 1500);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (providedHash.trim()) {
      simulateHashVerification();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Verify Product Integrity</h1>
        <p className="mb-8">
          Verify the integrity of your digital product by comparing its hash with the one provided by the seller.
        </p>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Hash Verification</h2>

          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label htmlFor="providedHash" className="block mb-2">
                Provided Hash (SHA-256)
              </label>
              <input
                type="text"
                id="providedHash"
                value={providedHash}
                onChange={(e) => setProvidedHash(e.target.value)}
                className="w-full p-2 border border-input rounded-md font-mono"
                placeholder="Enter the hash provided by the seller..."
              />
            </div>

            <div>
              <label htmlFor="file" className="block mb-2">
                File to Verify (Optional)
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                className="w-full p-2 border border-input rounded-md"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Upload the file to calculate its hash automatically
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!providedHash.trim() || isVerifying}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? "Verifying..." : "Verify Hash"}
              </button>
            </div>
          </form>
        </div>

        {calculatedHash && (
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Verification Results</h2>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Provided Hash</h3>
              <p className="bg-muted p-3 rounded-md font-mono break-all">{providedHash}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Calculated Hash</h3>
              <p className="bg-muted p-3 rounded-md font-mono break-all">{calculatedHash}</p>
            </div>

            {verificationResult === "success" && (
              <div className="bg-green-100 text-green-800 p-4 rounded-md">
                <h3 className="font-semibold mb-2">✓ Verification Successful</h3>
                <p>The hashes match. The file integrity is verified.</p>
              </div>
            )}

            {verificationResult === "failure" && (
              <div className="bg-red-100 text-red-800 p-4 rounded-md">
                <h3 className="font-semibold mb-2">✗ Verification Failed</h3>
                <p>The hashes do not match. The file may have been modified or corrupted.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What is Hash Verification?</h2>
          <p className="mb-4">
            A hash is a unique digital fingerprint of a file. By comparing the hash of your file with the one provided by the seller, you can verify that the file hasn't been modified or corrupted.
          </p>
          <p>
            SHA-256 is a secure hashing algorithm that produces a 64-character hexadecimal string. Even a tiny change in the file will produce a completely different hash.
          </p>
        </div>
      </div>
    </Layout>
  );
}
