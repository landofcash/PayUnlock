import { type PublicClient, formatUnits } from "viem";
import PayUnlockABI from "@/contracts/PayUnlock.sol/PayUnlock.json";

// Interface for product JSON data
export interface ProductJsonData {
  name: string;
  description: string;
  tokenId: string;
  price: string;
  publicKey: string;
  createdAt: string;
  seller: string;
}

// Interface for combined product data
export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  seller: string;
  buyer: string;
  fileId: string;
  status: number;
}

/**
 * Load product JSON data from CDN
 * @param fileId - The file ID to load JSON for
 * @returns Promise<ProductJsonData | null>
 */
export const loadProductJSON = async (fileId: string): Promise<ProductJsonData | null> => {
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

/**
 * Load all products from blockchain and combine with JSON metadata
 * @param publicClient - The wagmi public client
 * @param contractAddress - The PayUnlock contract address
 * @returns Promise<Product[]>
 */
export const loadProducts = async (
  publicClient: PublicClient,
  contractAddress: string
): Promise<Product[]> => {
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
    const [seller, price, currency, status, fileId, buyer] = product as [string, bigint, string, number, string, string];

    // Load product JSON data
    const productJsonData = await loadProductJSON(fileId);

    // Use JSON data if available, otherwise fall back to placeholder data
    const name = productJsonData?.name || `Product ${index}`;
    const description = productJsonData?.description || `Product with ID ${fileId}`;

    // Format the price (assuming 8 decimals for HBAR, 18 for other tokens)
    const decimals = currency === "0x0000000000000000000000000000000000000000" ? 8 : 18;
    const formattedPrice = formatUnits(price, decimals);

    return {
      id: index.toString(),
      name,
      description,
      price: formattedPrice,
      seller: seller,
      fileId,
      status,
      buyer:buyer
    };
  });

  return await Promise.all(formattedProductPromises);
};
