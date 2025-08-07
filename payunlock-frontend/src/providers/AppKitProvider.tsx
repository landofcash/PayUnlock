import { createAppKit } from "@reown/appkit/react";
import { hederaTestnet } from "@reown/appkit/networks";
import {getCurrentConfig} from "@/config.ts";
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {http, WagmiProvider} from "wagmi";
import type {LayoutProps} from "@/components/Layout.tsx";
import {getChainId} from "viem/actions";
import {createPublicClient} from "viem";

const config = getCurrentConfig();

const queryClient = new QueryClient()

const wagmiAdapter = new WagmiAdapter({
  networks:[hederaTestnet],
  transports: {
    [hederaTestnet.id]: http('https://testnet.hashio.io/api', {
      timeout: 30_000,
      retryCount: 3
    }),
  },
  projectId:config.hashConnect.projectId,
  ssr: false
})

createAppKit({
  projectId:config.hashConnect.projectId,
  adapters: [wagmiAdapter],
  networks:[hederaTestnet],
  metadata:config.hashConnect.metadata,
  features: {
    analytics: true,
  },
});
const client = createPublicClient({
  chain: hederaTestnet,
  transport: http(),
})
const chainId = await getChainId(client); // Current wallet chain
console.log('Current chain:', chainId);

export function AppKitProvider({ children }: LayoutProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
