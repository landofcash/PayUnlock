import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProductStatusBadge } from "../components/ProductStatusBadge";
import { useState, useEffect } from "react";
import { usePublicClient, useAccount } from "wagmi";
import { getCurrentConfig } from "@/config";
import { loadProducts, type Product } from "@/utils/productUtils";

export function MyPurchasesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const { address } = useAccount();
  const config = getCurrentConfig();
  const contractAddress = config.contracts.payUnlock.address;

  // Format address to show only first 6 and last 4 characters
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!publicClient || !address) return;

      try {
        setIsLoading(true);
        // Wait for all product details to be fetched
        const loadedProducts = await loadProducts(publicClient, contractAddress);

        const myPurchases = loadedProducts.filter(product => {
          return product.buyer.toLowerCase() === address.toLowerCase();
        });
        setProducts(myPurchases);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [publicClient, contractAddress, address]);

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        <p className="mb-8">Products you have purchased</p>

        {isLoading && (
          <div className="text-center py-10">
            <p>Loading your purchases...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && !address && !error && (
          <div className="text-center py-10">
            <p>Please connect your wallet to view your purchases.</p>
          </div>
        )}

        {!isLoading && address && products.length === 0 && !error && (
          <div className="text-center py-10">
            <p>You haven't purchased any products yet.</p>
            <Link
              to="/offers"
              className="inline-block mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse available products
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <ProductStatusBadge status={product.status} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{product.description}</p>
                <p className="text-muted-foreground mb-2">Seller: {formatAddress(product.seller)}</p>
                <p className="text-2xl mb-4">Price: {product.price} hBar</p>
                <Link
                  to={`/offer/${product.id}`}
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
