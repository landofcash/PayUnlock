import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import { getCurrentConfig } from "@/config";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";
import { type SessionTypes } from "@walletconnect/types";

interface WalletState {
  accountId: string | null;
  isConnected: boolean;
  walletName: string | null;
}

interface WalletContextType {
  walletState: WalletState;
  connector: DAppConnector | null;
  isConnecting: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [connector, setConnector] = useState<DAppConnector | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    accountId: null,
    isConnected: false,
    walletName: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionTopic, setSessionTopic] = useState<string | null>(null);

  // Initialize DAppConnector
  useEffect(() => {
    const initConnector = async () => {
      try {
        const config = getCurrentConfig();
        const { ledgerId, hashConnect: hcConfig } = config;

        const dappConnector = new DAppConnector(
          hcConfig.metadata,
          ledgerId,
          hcConfig.projectId,
          undefined, // methods
          undefined, // events
          undefined, // chains
          hcConfig.debug ? "debug" : "error" // logLevel
        );

        await dappConnector.init();
        setConnector(dappConnector);

      } catch (err) {
        console.error("Wallet connection initialization error:", err);
        setError("Failed to initialize wallet connection");
      }
    };

    initConnector();

    return () => {
      if (connector && sessionTopic) {
        connector.disconnect(sessionTopic).catch(console.error);
      }
    };
  }, []);

  const handleSessionConnect = (session: SessionTypes.Struct) => {
    console.log("Connected with wallet:", session);

    // Get the first account from the session
    if (session.namespaces.hedera && session.namespaces.hedera.accounts.length > 0) {
      const accountString = session.namespaces.hedera.accounts[0].split(':')[2];
      const walletName = session.peer.metadata.name || "Wallet";

      setWalletState({
        accountId: accountString,
        isConnected: true,
        walletName: walletName,
      });

      setSessionTopic(session.topic);
    }

    setIsConnecting(false);
    setError(null);
  };

  const connectWallet = async () => {
    if (!connector) {
      setError("Wallet connection not initialized");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const session = await connector.openModal();
      handleSessionConnect(session);
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      setError(err.message || "Failed to connect wallet");
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (connector && sessionTopic && walletState.isConnected) {
      try {
        await connector.disconnect(sessionTopic);
        setWalletState({
          accountId: null,
          isConnected: false,
          walletName: null,
        });
        setSessionTopic(null);
      } catch (err) {
        console.error("Disconnect error:", err);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletState,
        connector,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
