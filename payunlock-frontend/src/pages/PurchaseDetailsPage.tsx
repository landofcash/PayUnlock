import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function PurchaseDetailsPage() {
  const { id } = useParams<{ id: string }>();

  // This would typically fetch data from an API based on the ID
  const mockPurchase = {
    id,
    title: "Windows 11 Pro License",
    description: "Genuine Windows 11 Pro license key. Activate directly through Microsoft. Full support included.",
    price: "120",
    seller: "TechKeys",
    sellerRating: "4.9/5",
    status: "pending", // pending, delivered, disputed, completed
    purchaseDate: "2025-08-01",
    deliveryMethod: "Instant digital delivery",
    validityPeriod: "Lifetime",
    productKey: id === "201" ? "XXXX-XXXX-XXXX-XXXX-XXXX" : null, // Only show if delivered
    instructions: id === "201" ? "1. Go to Settings > System > Activation\n2. Click 'Change product key'\n3. Enter the key above\n4. Follow on-screen instructions" : null,
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/my-purchases" className="text-primary hover:underline">
            &larr; Back to my purchases
          </Link>
        </div>

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">{mockPurchase.title}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(mockPurchase.status)}`}>
            {mockPurchase.status.charAt(0).toUpperCase() + mockPurchase.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Purchase Details</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-medium">#{mockPurchase.id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchase Date</p>
                  <p className="font-medium">{mockPurchase.purchaseDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Price</p>
                  <p className="font-medium">${mockPurchase.price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Seller</p>
                  <p className="font-medium">{mockPurchase.seller}</p>
                </div>
              </div>

              <h3 className="font-semibold mt-6 mb-2">Description</h3>
              <p className="mb-4">{mockPurchase.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h3 className="font-semibold">Delivery Method</h3>
                  <p>{mockPurchase.deliveryMethod}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Validity Period</h3>
                  <p>{mockPurchase.validityPeriod}</p>
                </div>
              </div>
            </div>

            {/* Product Key Section - Only show if delivered */}
            {mockPurchase.productKey && (
              <div className="bg-card rounded-lg shadow-md p-6 border-2 border-green-200">
                <h2 className="text-xl font-semibold mb-4">Your Product Key</h2>
                <div className="bg-muted p-4 rounded-md font-mono text-center mb-4">
                  {mockPurchase.productKey}
                </div>

                {mockPurchase.instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Instructions</h3>
                    <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-sm">
                      {mockPurchase.instructions}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <div className="bg-card rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Actions</h2>

              {mockPurchase.status === 'pending' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    The seller is preparing your order. You'll receive your product key soon.
                  </p>
                  <Link
                    to={`/dispute/${mockPurchase.id}`}
                    className="block w-full text-center bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
                  >
                    Open Dispute
                  </Link>
                </div>
              )}

              {mockPurchase.status === 'delivered' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    Please confirm that you've received the product key and it works as expected.
                  </p>
                  <button
                    className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Confirm Receipt
                  </button>
                  <Link
                    to={`/dispute/${mockPurchase.id}`}
                    className="block w-full text-center bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
                  >
                    Open Dispute
                  </Link>
                </div>
              )}

              {mockPurchase.status === 'disputed' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Your dispute is being reviewed. An administrator will contact you soon.
                  </p>
                  <Link
                    to={`/dispute/${mockPurchase.id}`}
                    className="block w-full text-center bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    View Dispute Details
                  </Link>
                </div>
              )}

              {mockPurchase.status === 'completed' && (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This transaction has been completed successfully.
                  </p>
                  <Link
                    to="/verify"
                    className="block w-full text-center bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    Verify Product Hash
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
