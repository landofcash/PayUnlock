import { useState } from 'react';
import { useAppKitNetwork, useAppKitAccount } from '@reown/appkit/react'
import { usePublicClient, useWalletClient } from 'wagmi'
import {encodeFunctionData, toHex} from 'viem'
import PayUnlockABI from '@/contracts/PayUnlock.sol/PayUnlock.json';
import {Layout} from "@/components/Layout.tsx";

const CONTRACT_ADDRESS = '0xd1927B79FD55A0F89E2e9524033c0206D2a721d0';
const EXPECTED_CHAIN_ID = 296;

export default function CreateProductDebug() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const [isPending, setIsPending] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  const handleWrite = async () => {
    if (!publicClient || !walletClient.data || !address) return;

    const fileId = `j960qFveTyWSxpEgutgmvg`;
    const priceInWei = 100000000;
    const currency = `0x0000000000000000000000000000000000000000`;
    const publicKeyBytes = toHex(`A/cAg/DHpfHMqdU/UwgtYBs5qBAVcf/89agVTYSxGaaM`);
    const args =  [fileId, priceInWei, currency, publicKeyBytes];

    setIsPending(true);

    try {
      // Try simulation first
      try {
        const result = await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: PayUnlockABI.abi,
          functionName: 'createProduct',
          args: args,
          account: address as `0x${string}`,
        });
        log(`✅ Simulation successful ${JSON.stringify(result, null, 2) || 'No result returned'}`);
      } catch (simError: any) {
        log(`❌ Simulation failed: ${simError.shortMessage || simError.message}`);

        // Check if it's a function selector issue
        if (simError.message.includes('function selector')) {
          log(`🚨 Function selector mismatch - wrong ABI or contract!`);
        }
      }

      const data = encodeFunctionData({
        abi: PayUnlockABI.abi,
        functionName: 'createProduct',
        args:args
      });

      log(`📤 Sending transaction...`);

      const hash = await walletClient.data.sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
        gas: 100_000_000n,
      });

      log(`Transaction sent: ${hash}`);
      setLastTx(hash);

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      log(`Status: ${receipt.status}`);
      log(`Gas used: ${receipt.gasUsed.toString()}`);

    } catch (error: any) {
      log(`Error: ${error.shortMessage || error.message}`);
    } finally {
      setIsPending(false);
    }
  };

  if (!isConnected || chainId !== EXPECTED_CHAIN_ID) {
    return <div className="p-4">❌ Connect to Hedera Testnet to continue.</div>;
  }

  return (
    <Layout>
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-bold">🔧 Debug Contract Analysis</h2>

        <div className="flex gap-4">
          <button
            onClick={handleWrite}
            disabled={isPending}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isPending ? 'Sending...' : 'Write debug'}
          </button>
        </div>

        <div className="text-sm">
          <strong>Contract Address:</strong> <code>{CONTRACT_ADDRESS}</code>
        </div>

        {lastTx && (
          <div>
            <strong>Last TX:</strong>{' '}
            <a
              href={`https://hashscan.io/testnet/transaction/${lastTx}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {lastTx.substring(0, 20)}...
            </a>
          </div>
        )}

        <div className="bg-gray-100 p-4 rounded max-h-60 overflow-y-auto">
          <strong>Analysis:</strong>
          {logs.map((log, i) => (
            <div key={i} className="text-sm font-mono">{log}</div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
