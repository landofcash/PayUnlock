import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  Bug,
  Home,
  ShoppingBag,
  Package,
  ShoppingCart,
  Store
} from 'lucide-react';
import { WalletConnectButton } from './WalletConnectButton';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import PayUnlockLogo from '../assets/PayUnlock-logo.png';

export interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo and Brand Name */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-primary-foreground rounded-full p-1.5">
                  <img
                    src={PayUnlockLogo}
                    alt="PayUnlock Logo"
                    className="h-7 w-7 object-contain"
                  />
                </div>
                <span className="text-xl font-bold">PayUnlock</span>
              </Link>

              {/* Navigation Menu - Left Side */}
              <nav className="flex items-center ml-8 space-x-1">
                <Link to="/" className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
                  <Home className="h-4 w-4" />
                  <span>Home</span>
                </Link>
                <Link to="/offers" className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
                  <ShoppingBag className="h-4 w-4" />
                  <span>All Products</span>
                </Link>
                <Link to="/my-offers" className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
                  <Package className="h-4 w-4" />
                  <span>My Products</span>
                </Link>
                <Link to="/my-purchases" className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
                  <ShoppingCart className="h-4 w-4" />
                  <span>My Purchases</span>
                </Link>
                <Link to="/create" className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
                  <Store className="h-4 w-4" />
                  <span>Sell</span>
                </Link>
              </nav>
            </div>

            {/* Right Side - Debug and Wallet */}
            <div className="flex items-center space-x-3">
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-primary-foreground/10 transition-colors">
                    <Bug className="h-4 w-4" />
                    <span>Debug</span>
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
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 PayUnlock. All rights reserved. </p>
        </div>
      </footer>
    </div>
  );
}
