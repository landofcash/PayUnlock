import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function SendKeyPage() {
  const { id } = useParams<{ id: string }>();

  // This would typically fetch data from an API based on the ID
  const mockOrder = {
    id: "ORD-" + id,
    productTitle: "Windows 11 Pro License",
    buyerName: "John Doe",
    buyerEmail: "john.doe@example.com",
    price: "120",
    purchaseDate: "2025-08-04",
    status: "Paid - Awaiting Delivery",
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link to="/my-offers" className="text-primary hover:underline">
            &larr; Back to my offers
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6">Send Product Key</h1>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-muted-foreground">Order ID</p>
              <p className="font-medium">{mockOrder.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Product</p>
              <p className="font-medium">{mockOrder.productTitle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Buyer</p>
              <p className="font-medium">{mockOrder.buyerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{mockOrder.buyerEmail}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium">${mockOrder.price}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Purchase Date</p>
              <p className="font-medium">{mockOrder.purchaseDate}</p>
            </div>
          </div>

          <div className="bg-muted p-3 rounded-md mb-6">
            <p className="text-sm font-medium">Status: {mockOrder.status}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Send Product Key</h2>
          <p className="mb-6 text-muted-foreground">
            The key will be encrypted and securely delivered to the buyer.
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="productKey" className="block mb-2">
                Product Key or License
              </label>
              <textarea
                id="productKey"
                rows={3}
                className="w-full p-2 border border-input rounded-md font-mono"
                placeholder="Enter the product key or license information..."
              ></textarea>
              <p className="text-sm text-muted-foreground mt-1">
                This information will be encrypted and only visible to the buyer
              </p>
            </div>

            <div>
              <label htmlFor="instructions" className="block mb-2">
                Additional Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                rows={3}
                className="w-full p-2 border border-input rounded-md"
                placeholder="Provide any additional instructions for using the key..."
              ></textarea>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Send Key to Buyer
              </button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Once sent, the escrow will be released after the buyer confirms receipt
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
