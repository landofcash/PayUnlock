import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function MyPurchasesPage() {
  // This would typically fetch data from an API
  const mockPurchases = [
    {
      id: "201",
      title: "Windows 11 Pro License",
      price: "120",
      seller: "TechKeys",
      status: "delivered",
      purchaseDate: "2025-07-25"
    },
    {
      id: "202",
      title: "Adobe Creative Cloud 1-Year",
      price: "240",
      seller: "SoftwarePlus",
      status: "pending",
      purchaseDate: "2025-08-01"
    },
    {
      id: "203",
      title: "Game Key - Latest RPG",
      price: "59",
      seller: "GameDeals",
      status: "disputed",
      purchaseDate: "2025-08-03"
    },
  ];

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-6">My Purchases</h1>
        <p className="mb-8">View and manage your purchased digital products</p>

        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Seller</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Purchase Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockPurchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td className="p-4">
                    <Link to={`/purchase/${purchase.id}`} className="text-primary hover:underline">
                      {purchase.title}
                    </Link>
                  </td>
                  <td className="p-4">${purchase.price}</td>
                  <td className="p-4">{purchase.seller}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(purchase.status)}`}>
                      {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">{purchase.purchaseDate}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Link
                        to={`/purchase/${purchase.id}`}
                        className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-secondary/90 transition-colors"
                      >
                        View
                      </Link>
                      {purchase.status === 'pending' && (
                        <Link
                          to={`/dispute/${purchase.id}`}
                          className="text-sm bg-destructive text-white px-2 py-1 rounded hover:bg-destructive/90 transition-colors"
                        >
                          Dispute
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mockPurchases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't made any purchases yet</p>
            <Link
              to="/offers"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Browse Available Offers
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
