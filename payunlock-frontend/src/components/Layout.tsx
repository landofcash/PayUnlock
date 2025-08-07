import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Bug } from 'lucide-react';
import { WalletConnectButton } from './WalletConnectButton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">PayUnlock</Link>
            <div className="flex items-center space-x-6">
              <nav className="flex space-x-6 items-center">
                <Link to="/" className="hover:underline">Home</Link>
                <Link to="/offers" className="hover:underline">Offers</Link>
                <Link to="/my-offers" className="hover:underline">My Offers</Link>
                <Link to="/my-purchases" className="hover:underline">My Purchases</Link>
                <Link to="/create" className="hover:underline">Create Offer</Link>
                <Link to="/verify" className="hover:underline">Verify</Link>
                <Link to="/faq" className="hover:underline">FAQ</Link>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-2 hover:bg-primary-foreground/10 rounded-md transition-colors">
                      <Bug className="h-5 w-5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none mb-3">Debug Tools</h4>
                      <div className="flex flex-col space-y-2">
                        <Link
                          to="/debug/wallet-sign"
                          className="text-sm hover:underline p-2 hover:bg-accent rounded-sm transition-colors"
                        >
                          Wallet Sign Debug
                        </Link>
                        <Link
                          to="/debug/test-contract"
                          className="text-sm hover:underline p-2 hover:bg-accent rounded-sm transition-colors"
                        >
                          Contract Debug
                        </Link>
                        <Link
                          to="/debug/test-create"
                          className="text-sm hover:underline p-2 hover:bg-accent rounded-sm transition-colors"
                        >
                          Create Product Debug
                        </Link>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </nav>
              <div className="ml-4">
                <WalletConnectButton />
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 PayUnlock. All rights reserved.</p>
          <div className="mt-2">
            <Link to="/terms" className="hover:underline text-sm">Terms and Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
