import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Button } from './ui/button';
import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

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
      <Button onClick={() => open()}>
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => open({ view: 'Account' })}
        className="flex items-center gap-2"
      >
        <div className="h-2 w-2 rounded-full bg-green-500" />
        {address ? formatAddress(address) : 'Connected'}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        title="Copy address"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={openExplorer}
        title="View on explorer"
      >
        <ExternalLink size={16} />
      </Button>
    </div>
  );
}
