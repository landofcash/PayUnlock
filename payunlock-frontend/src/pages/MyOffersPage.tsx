import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function MyOffersPage() {
  // This would typically fetch data from an API
  const mockMyOffers = [
    {
      id: "101",
      title: "Windows 11 Pro License",
      price: "120",
      status: "active",
      sales: 5,
      created: "2025-07-15"
    },
    {
      id: "102",
      title: "Photoshop 2025 License",
      price: "199",
      status: "active",
      sales: 3,
      created: "2025-07-20"
    },
    {
      id: "103",
      title: "Game Key - Strategy Game",
      price: "45",
      status: "sold",
      sales: 1,
      created: "2025-08-01"
    },
  ];

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Offers</h1>
          <Link
            to="/create"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Create New Offer
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-4">Title</th>
                <th className="text-left p-4">Price</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Sales</th>
                <th className="text-left p-4">Created</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockMyOffers.map((offer) => (
                <tr key={offer.id}>
                  <td className="p-4">
                    <Link to={`/offer/${offer.id}`} className="text-primary hover:underline">
                      {offer.title}
                    </Link>
                  </td>
                  <td className="p-4">${offer.price}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      offer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">{offer.sales}</td>
                  <td className="p-4">{offer.created}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Link
                        to={`/send-key/${offer.id}`}
                        className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-secondary/90 transition-colors"
                      >
                        Send Key
                      </Link>
                      <button
                        className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded hover:bg-muted/90 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {mockMyOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't created any offers yet</p>
            <Link
              to="/create"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Create Your First Offer
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
