import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Copy, Check, ExternalLink, Wallet } from 'lucide-react';

export function WalletConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const openExplorer = () => {
    if (address) {
      // Update this URL based on your network (Hedera in your case)
      window.open(`https://hashscan.io/mainnet/account/${address}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => open({ view: 'Account' })}
        className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />
        <span>{address ? formatAddress(address) : 'Connected'}</span>
      </button>

      <button
        className="p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
        onClick={copyToClipboard}
        title="Copy address"
      >
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </button>

      <button
        className="p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
        onClick={openExplorer}
        title="View on explorer"
      >
        <ExternalLink className="h-4 w-4" />
      </button>
    </div>
  );
}
