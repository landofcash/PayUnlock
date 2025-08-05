import { Layout } from "../components/Layout";

export function CreateOfferPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Offer</h1>
        <p className="mb-8">List your digital product securely with escrow protection</p>

        <div className="bg-card rounded-lg shadow-md p-6">
          <form className="space-y-6">
            <div>
              <label htmlFor="title" className="block mb-2">
                Offer Title
              </label>
              <input
                type="text"
                id="title"
                className="w-full p-2 border border-input rounded-md"
                placeholder="e.g., Windows 11 Pro License"
              />
            </div>

            <div>
              <label htmlFor="description" className="block mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full p-2 border border-input rounded-md"
                placeholder="Provide detailed information about your digital product..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  id="price"
                  className="w-full p-2 border border-input rounded-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label htmlFor="validity" className="block mb-2">
                  Validity Period
                </label>
                <select
                  id="validity"
                  className="w-full p-2 border border-input rounded-md"
                >
                  <option value="lifetime">Lifetime</option>
                  <option value="1-year">1 Year</option>
                  <option value="2-year">2 Years</option>
                  <option value="3-year">3 Years</option>
                  <option value="other">Other (specify in description)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="terms" className="block mb-2">
                Terms of Use
              </label>
              <textarea
                id="terms"
                rows={3}
                className="w-full p-2 border border-input rounded-md"
                placeholder="Specify any usage restrictions or terms..."
              ></textarea>
            </div>

            <div>
              <label htmlFor="hash" className="block mb-2">
                Product Hash (optional)
              </label>
              <input
                type="text"
                id="hash"
                className="w-full p-2 border border-input rounded-md"
                placeholder="SHA-256 hash for verification"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Providing a hash allows buyers to verify the integrity of your product
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Create Offer
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
