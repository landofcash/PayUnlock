import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function DisputePage() {
  const { id } = useParams<{ id: string }>();

  // This would typically fetch data from an API based on the ID
  const mockDispute = {
    id: "D-" + id,
    purchaseId: id,
    productTitle: "Windows 11 Pro License",
    seller: "TechKeys",
    price: "120",
    purchaseDate: "2025-08-01",
    status: "open", // open, under_review, resolved
    reason: id === "203" ? "Product key doesn't work" : "",
    buyerComments: id === "203" ? "The product key I received gives an error when trying to activate Windows." : "",
    sellerResponse: id === "203" ? "We've verified the issue and will provide a new key within 24 hours." : "",
    adminNotes: id === "203" ? "Verified issue with Microsoft activation servers. Seller has agreed to provide a new key." : "",
    createdAt: id === "203" ? "2025-08-03" : new Date().toISOString().split('T')[0],
    updatedAt: id === "203" ? "2025-08-04" : new Date().toISOString().split('T')[0],
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to={`/purchase/${mockDispute.purchaseId}`} className="text-primary hover:underline">
            &larr; Back to purchase
          </Link>
        </div>

        <div className="flex justify-between items-start mb-6">
          <h1 className="text-3xl font-bold">Dispute Resolution</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(mockDispute.status)}`}>
            {formatStatus(mockDispute.status)}
          </span>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dispute Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-muted-foreground">Dispute ID</p>
              <p className="font-medium">{mockDispute.id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Purchase ID</p>
              <p className="font-medium">#{mockDispute.purchaseId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Product</p>
              <p className="font-medium">{mockDispute.productTitle}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Seller</p>
              <p className="font-medium">{mockDispute.seller}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Price</p>
              <p className="font-medium">${mockDispute.price}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Purchase Date</p>
              <p className="font-medium">{mockDispute.purchaseDate}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dispute Created</p>
              <p className="font-medium">{mockDispute.createdAt}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">{mockDispute.updatedAt}</p>
            </div>
          </div>
        </div>

        {mockDispute.status === 'open' && !mockDispute.reason && (
          <div className="bg-card rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Submit Dispute</h2>
            <form className="space-y-6">
              <div>
                <label htmlFor="reason" className="block mb-2">
                  Reason for Dispute
                </label>
                <select
                  id="reason"
                  className="w-full p-2 border border-input rounded-md"
                >
                  <option value="">Select a reason</option>
                  <option value="key_not_working">Product key doesn't work</option>
                  <option value="not_as_described">Product not as described</option>
                  <option value="no_delivery">No delivery received</option>
                  <option value="other">Other (please explain)</option>
                </select>
              </div>

              <div>
                <label htmlFor="comments" className="block mb-2">
                  Detailed Explanation
                </label>
                <textarea
                  id="comments"
                  rows={5}
                  className="w-full p-2 border border-input rounded-md"
                  placeholder="Please provide details about the issue..."
                ></textarea>
              </div>

              <div>
                <label htmlFor="evidence" className="block mb-2">
                  Evidence (Optional)
                </label>
                <input
                  type="file"
                  id="evidence"
                  className="w-full p-2 border border-input rounded-md"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload screenshots or other evidence to support your claim
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Submit Dispute
                </button>
              </div>
            </form>
          </div>
        )}

        {(mockDispute.reason || mockDispute.status !== 'open') && (
          <div className="bg-card rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Dispute Information</h2>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Reason for Dispute</h3>
              <p className="bg-muted p-3 rounded-md">{mockDispute.reason}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Your Comments</h3>
              <p className="bg-muted p-3 rounded-md whitespace-pre-wrap">{mockDispute.buyerComments}</p>
            </div>

            {mockDispute.sellerResponse && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Seller Response</h3>
                <p className="bg-muted p-3 rounded-md whitespace-pre-wrap">{mockDispute.sellerResponse}</p>
              </div>
            )}

            {mockDispute.adminNotes && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Admin Notes</h3>
                <p className="bg-muted p-3 rounded-md whitespace-pre-wrap">{mockDispute.adminNotes}</p>
              </div>
            )}

            {mockDispute.status === 'open' && (
              <div className="pt-4">
                <textarea
                  rows={3}
                  className="w-full p-2 border border-input rounded-md mb-4"
                  placeholder="Add additional comments..."
                ></textarea>
                <button
                  className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Update Dispute
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
