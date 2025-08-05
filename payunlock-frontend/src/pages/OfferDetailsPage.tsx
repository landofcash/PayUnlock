import { useParams, Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function OfferDetailsPage() {
  const { id } = useParams<{ id: string }>();

  // This would typically fetch data from an API based on the ID
  const mockOffer = {
    id,
    title: "Windows 11 Pro License",
    description: "Genuine Windows 11 Pro license key. Activate directly through Microsoft. Full support included.",
    price: "120",
    seller: "TechKeys",
    sellerRating: "4.9/5",
    deliveryMethod: "Instant digital delivery",
    validityPeriod: "Lifetime",
    termsOfUse: "For use on a single device. Non-transferable after activation.",
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/offers" className="text-primary hover:underline">
            &larr; Back to all offers
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{mockOffer.title}</h1>

            <div className="flex flex-col md:flex-row md:justify-between mb-8">
              <div className="mb-4 md:mb-0">
                <p className="text-muted-foreground">Seller: {mockOffer.seller}</p>
                <p className="text-muted-foreground">Rating: {mockOffer.sellerRating}</p>
              </div>
              <div className="text-3xl font-bold">${mockOffer.price}</div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="mb-4">{mockOffer.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div>
                  <h3 className="font-semibold">Delivery Method</h3>
                  <p>{mockOffer.deliveryMethod}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Validity Period</h3>
                  <p>{mockOffer.validityPeriod}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-2">Terms of Use</h2>
              <p>{mockOffer.termsOfUse}</p>
            </div>

            <div className="mt-8">
              <button className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md text-lg font-semibold hover:bg-primary/90 transition-colors">
                Purchase Now
              </button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Secure payment with escrow protection
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
