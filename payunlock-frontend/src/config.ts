export interface TokenConfig {
  id: string; // Hedera uses token IDs like "0.0.123456"
  name: string;
  decimals: number;
  symbol: string;
}

export interface HashConnectMetadata {
  name: string;
  description: string;
  icons: string[];
  url: string;
}

export interface ContractConfig {
  payUnlock: {
    address: string;
    deploymentBlock?: number;
  };
}

export interface NetworkConfig {
  name: 'testnet' | 'mainnet';
  networkId: string;
  supportedTokens: TokenConfig[];
  apiUrl?: string;
  explorerBaseUrl: string;
  mirrorNodeUrl: string;
  contracts: ContractConfig;
  walletConnectProjectId: string; // Project ID for WalletConnect
  hashConnect: {
    projectId: string;
    metadata: HashConnectMetadata;
    debug: boolean;
  };
}

const configs: Record<'testnet' | 'mainnet', NetworkConfig> = {
  testnet: {
    name: 'testnet',
    networkId: 'testnet',
    supportedTokens: [
      { id: '0.0.0', name: 'HBAR', decimals: 8, symbol: 'HBAR' },
      // Add other testnet tokens as needed
    ],
    apiUrl: 'https://testnet.hashio.io/api',
    explorerBaseUrl: 'https://hashscan.io/testnet',
    mirrorNodeUrl: 'https://testnet.mirrornode.hedera.com',
    walletConnectProjectId: '6168d32eb2f7a8d1228c9e1e1bd3ea68',
    hashConnect: {
      projectId: '6168d32eb2f7a8d1228c9e1e1bd3ea68',
      metadata: {
        name: 'PayUnlock',
        description: 'Secure payment unlocking platform on Hedera',
        icons: [`${window.location.origin}/favicon.ico`],
        url: window.location.origin,
      },
      debug: true,
    },
    contracts: {
      payUnlock: {
        address: '0x953aFC7f6d3201D7D76BB146542E144b31504Ac5',
        deploymentBlock: 0
      }
    }
  },
  mainnet: {
    name: 'mainnet',
    networkId: 'mainnet',
    supportedTokens: [
      { id: '0.0.0', name: 'HBAR', decimals: 8, symbol: 'HBAR' },
      // Add other mainnet tokens as needed
    ],
    apiUrl: 'https://mainnet.hashio.io/api',
    explorerBaseUrl: 'https://hashscan.io/mainnet',
    mirrorNodeUrl: 'https://mainnet.mirrornode.hedera.com',
    walletConnectProjectId: '6168d32eb2f7a8d1228c9e1e1bd3ea68',
    hashConnect: {
      projectId: '6168d32eb2f7a8d1228c9e1e1bd3ea68',
      metadata: {
        name: 'PayUnlock',
        description: 'Secure payment unlocking platform on Hedera',
        icons: [`${window.location.origin}/favicon.ico`],
        url: window.location.origin,
      },
      debug: false,
    },
    contracts: {
      payUnlock: {
        address: '0x953aFC7f6d3201D7D76BB146542E144b31504Ac5',
        deploymentBlock: 0
      }
    }
  }
};

export const getConfig = (network: 'testnet' | 'mainnet'): NetworkConfig => configs[network];

export const getCurrentConfig = (): NetworkConfig => {
  const network = (localStorage.getItem("hedera_network") as "mainnet" | "testnet") || "testnet";
  return getConfig(network);
};

export const signPrefix = "payunlock-";
