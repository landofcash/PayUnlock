import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function HomePage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to PayUnlock</h1>
        <p className="text-xl mb-8">
          The secure marketplace for digital keys and licenses
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-card p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">For Buyers</h2>
            <p className="mb-4">
              Browse secure offers with escrow protection. Only pay when you're satisfied.
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
              Create secure offers and sell your digital products with confidence.
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
