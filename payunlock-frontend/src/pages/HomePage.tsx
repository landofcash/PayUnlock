import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function HomePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to PayUnlock</h1>
        <p className="text-xl">
          MVP of a decentralized escrow marketplace for digital products, powered by Hedera.
        </p>
        <p className="text-xl mb-8">
          DEFI approach, real-world use cases, and a focus on security.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">For Buyers</h2>
            <p className="mb-4">
              Shop with confidence using on-chain escrow.
              Your payment is held in a Hedera smart contract and only released when your digital product is securely delivered.
            </p>
            <Link
              to="/offers"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse Offers
            </Link>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">For Sellers</h2>
            <p className="mb-4">
              Sell your digital products with built-in on-chain escrow. Get paid automatically once delivery is confirmed — no middlemen, no chargebacks.
            </p>
            <Link
              to="/create"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Create an Offer
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
