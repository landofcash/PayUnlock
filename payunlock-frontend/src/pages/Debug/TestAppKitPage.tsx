import { useEffect, useState } from 'react';
import { useAppKitNetwork, useAppKitAccount } from '@reown/appkit/react'
import { useReadContract, usePublicClient, useWalletClient } from 'wagmi'
import { encodeFunctionData, keccak256, toHex } from 'viem'

import PayUnlockABI from '@/contracts/PayUnlock.sol/PayUnlock.json';
import {Layout} from "@/components/Layout.tsx";

const CONTRACT_ADDRESS = '0x953aFC7f6d3201D7D76BB146542E144b31504Ac5';
const EXPECTED_CHAIN_ID = 296;

export default function DebugContractTest() {
  const { address, isConnected } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();

  const publicClient = usePublicClient();
  const walletClient = useWalletClient();

  const [input, setInput] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev, msg]);
  };

  // Check what's deployed at the contract address
  const checkContract = async () => {
    if (!publicClient) return;

    setLogs([]);

    try {
      // Check if there's code at the address
      const bytecode = await publicClient.getBytecode({ address: CONTRACT_ADDRESS });
      log(`📋 Bytecode length: ${bytecode ? bytecode.length : 'No bytecode found!'}`);

      if (bytecode) {
        log(`📋 First 20 bytes: ${bytecode.substring(0, 42)}`);
      }

      // Check debugWrite function selector
      const debugWriteSelector = keccak256(toHex('debugWrite(string)')).substring(0, 10);
      log(`🔍 debugWrite selector should be: ${debugWriteSelector}`);

      // Try to call debugRead to see if it exists
      try {
        const result = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: PayUnlockABI.abi,
          functionName: 'debugRead',
        });
        log(`✅ debugRead works, current value: "${result}"`);
      } catch (readError: any) {
        log(`❌ debugRead failed: ${readError.shortMessage || readError.message}`);
      }

    } catch (error: any) {
      log(`❌ Contract check failed: ${error.message}`);
    }
  };

  const handleWrite = async () => {
    if (!input || !publicClient || !walletClient.data || !address) return;

    setIsPending(true);

    try {
      // Try simulation first
      try {
        const result = await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: PayUnlockABI.abi,
          functionName: 'debugWrite',
          args: [input],
          account: address as `0x${string}`,
        });
        log(`✅ Simulation successful`);
      } catch (simError: any) {
        log(`❌ Simulation failed: ${simError.shortMessage || simError.message}`);

        // Check if it's a function selector issue
        if (simError.message.includes('function selector')) {
          log(`🚨 Function selector mismatch - wrong ABI or contract!`);
        }
      }

      const data = encodeFunctionData({
        abi: PayUnlockABI.abi,
        functionName: 'debugWrite',
        args: [input]
      });

      log(`📤 Sending transaction...`);

      const hash = await walletClient.data.sendTransaction({
        to: CONTRACT_ADDRESS,
        data,
        gas: 100_000n, // Lower gas for simple operation
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

        <div className="flex gap-4 mb-4">
          <button
            onClick={checkContract}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            🔍 Check Contract
          </button>
        </div>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Debug message"
          className="border p-2 rounded w-full max-w-md"
        />

        <div className="flex gap-4">
          <button
            onClick={handleWrite}
            disabled={!input || isPending}
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
