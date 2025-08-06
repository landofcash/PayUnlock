import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, User, LogOut, AlertCircle, Loader2 } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";

export default function WalletConnectButton() {
  const { walletState, connector, isConnecting, error, connectWallet, disconnectWallet } = useWallet();
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-wallet-dropdown]')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showDropdown]);

  const formatAccountId = (accountId: string) => {
    if (accountId.length > 10) {
      return `${accountId.slice(0, 6)}...${accountId.slice(-4)}`;
    }
    return accountId;
  };

  const copyAccountId = async () => {
    if (walletState.accountId) {
      try {
        await navigator.clipboard.writeText(walletState.accountId);
        // You could add a toast notification here
      } catch (err) {
        console.error('Failed to copy account ID:', err);
      }
    }
  };

  if (!walletState.isConnected) {
    return (
      <div className="relative">
        <Button
          onClick={connectWallet}
          disabled={isConnecting || !connector}
          variant="outline"
          className="bg-background/95 backdrop-blur hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </>
          )}
        </Button>

        {error && (
          <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-destructive/90 text-destructive-foreground text-sm rounded-md backdrop-blur-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {isConnecting && !walletState.isConnected && (
          <div className="absolute top-full right-0 mt-2 w-72 p-3 bg-primary/90 text-primary-foreground text-sm rounded-md backdrop-blur-sm">
            <p>Please approve the connection in your wallet</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" data-wallet-dropdown>
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        variant="outline"
        className="bg-green-50 border-green-200 hover:bg-green-100 text-green-800 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">
            {formatAccountId(walletState.accountId || "")}
          </span>
        </div>
      </Button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg backdrop-blur-sm z-50">
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {walletState.walletName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Connected Wallet
                </p>
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="mb-3">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Account ID
              </label>
              <button
                onClick={copyAccountId}
                className="w-full mt-1 p-2 text-sm font-mono bg-muted rounded text-left hover:bg-muted/80 transition-colors"
                title="Click to copy"
              >
                {walletState.accountId}
              </button>
            </div>

            <Button
              onClick={disconnectWallet}
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
