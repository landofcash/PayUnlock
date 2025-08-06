import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import WalletConnectButton from './WalletConnectButton';

interface LayoutProps {
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
              <nav className="flex space-x-6">
                <Link to="/" className="hover:underline">Home</Link>
                <Link to="/offers" className="hover:underline">Offers</Link>
                <Link to="/my-offers" className="hover:underline">My Offers</Link>
                <Link to="/my-purchases" className="hover:underline">My Purchases</Link>
                <Link to="/create" className="hover:underline">Create Offer</Link>
                <Link to="/verify" className="hover:underline">Verify</Link>
                <Link to="/faq" className="hover:underline">FAQ</Link>
              </nav>
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
          <p>© 2025 PayUnlock. All rights reserved.</p>
          <div className="mt-2">
            <Link to="/terms" className="hover:underline text-sm">Terms and Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
