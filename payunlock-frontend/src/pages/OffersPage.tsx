import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function OffersPage() {
  // This would typically fetch data from an API
  const mockOffers = [
    { id: "1", title: "Windows 11 Pro License", price: "120", seller: "TechKeys" },
    { id: "2", title: "Adobe Creative Cloud 1-Year", price: "240", seller: "SoftwarePlus" },
    { id: "3", title: "Office 365 Family Plan", price: "99", seller: "MSPartner" },
    { id: "4", title: "Antivirus Premium 2025", price: "45", seller: "SecureKeys" },
    { id: "5", title: "Game Key - Latest RPG", price: "59", seller: "GameDeals" },
    { id: "6", title: "VPN Service - 2 Years", price: "79", seller: "PrivacyNow" },
  ];

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold mb-6">Available Offers</h1>
        <p className="mb-8">Browse all available digital keys and licenses</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockOffers.map((offer) => (
            <div key={offer.id} className="bg-card rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{offer.title}</h2>
                <p className="text-muted-foreground mb-2">Seller: {offer.seller}</p>
                <p className="text-2xl font-bold mb-4">${offer.price}</p>
                <Link
                  to={`/offer/${offer.id}`}
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
