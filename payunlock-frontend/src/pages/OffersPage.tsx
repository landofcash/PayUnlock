import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";
import { ProductStatusBadge } from "../components/ProductStatusBadge";
import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
import { formatUnits } from "viem";
import PayUnlockABI from "@/contracts/PayUnlock.sol/PayUnlock.json";
import { getCurrentConfig } from "@/config";

// Interface for product JSON data
interface ProductJsonData {
  name: string;
  description: string;
  tokenId: string;
  price: string;
  publicKey: string;
  createdAt: string;
  seller: string;
}

// Interface for combined product data
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  seller: string;
  fileId: string;
  status: number;
}

export function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publicClient = usePublicClient();
  const config = getCurrentConfig();
  const contractAddress = config.contracts.payUnlock.address;

  // Method to load product JSON data
  const loadProductJSON = async (fileId: string): Promise<ProductJsonData | null> => {
    try {
      const response = await fetch(`https://algoosh.b-cdn.net/payunlock/${fileId}.json`);
      if (!response.ok) {
        console.warn(`Failed to load JSON for product ${fileId}: ${response.status}`);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`Error loading JSON for product ${fileId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!publicClient) return;

      try {
        setIsLoading(true);

        // Get the total number of products
        const nextId = await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: PayUnlockABI.abi,
          functionName: 'nextId',
        }) as bigint;

        const productPromises = [];

        // Fetch all products from blockchain
        for (let i = 0; i < Number(nextId); i++) {
          productPromises.push(
            publicClient.readContract({
              address: contractAddress as `0x${string}`,
              abi: PayUnlockABI.abi,
              functionName: 'products',
              args: [i],
            })
          );
        }

        const productResults = await Promise.all(productPromises);

        // Process the results and fetch JSON data for each product
        const formattedProductPromises = productResults.map(async (product: any, index) => {
          // Extract product data from blockchain
          const [seller, price, currency, status, fileId] = product as [string, bigint, string, number, string];

          // Load product JSON data
          const productJsonData = await loadProductJSON(fileId);

          // Use JSON data if available, otherwise fall back to placeholder data
          const name = productJsonData?.name || `Product ${index}`;
          const description = productJsonData?.description || `Product with ID ${fileId}`;

          // Format the price (assuming 8 decimals for HBAR, 18 for other tokens)
          const decimals = currency === "0x0000000000000000000000000000000000000000" ? 8 : 18;
          const formattedPrice = formatUnits(price, decimals);

          // Format seller address
          const formattedSeller = seller.substring(0, 6) + "..." + seller.substring(seller.length - 4);

          return {
            id: index.toString(),
            name,
            description,
            price: formattedPrice,
            seller: formattedSeller,
            fileId,
            status
          };
        });

        const formattedProducts = await Promise.all(formattedProductPromises);
        setProducts(formattedProducts);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to fetch products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [publicClient, contractAddress]);

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Available Products</h1>
        <p className="mb-8">Browse all available digital products</p>

        {isLoading && (
          <div className="text-center py-10">
            <p>Loading products...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {!isLoading && products.length === 0 && !error && (
          <div className="text-center py-10">
            <p>No products available yet.</p>
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
                <p className="text-muted-foreground mb-2">Seller: {product.seller}</p>
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
