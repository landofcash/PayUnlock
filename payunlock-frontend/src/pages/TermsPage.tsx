import { Layout } from "../components/Layout";

export function TermsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        <p className="text-muted-foreground mb-8">Last updated: August 5, 2025</p>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to PayUnlock ("we," "our," or "us"). These Terms and Conditions govern your use of the PayUnlock platform, including our website, services, and features (collectively, the "Service").
          </p>
          <p className="mb-4">
            By accessing or using the Service, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our Service.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">2. Definitions</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>"User"</strong> refers to any individual who accesses or uses the Service.</li>
            <li><strong>"Buyer"</strong> refers to a User who purchases digital products through the Service.</li>
            <li><strong>"Seller"</strong> refers to a User who offers digital products for sale through the Service.</li>
            <li><strong>"Digital Products"</strong> refers to digital keys, licenses, and other digital goods offered for sale on the Service.</li>
            <li><strong>"Escrow"</strong> refers to the holding of funds by PayUnlock until the conditions of a transaction are met.</li>
          </ul>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
          <p className="mb-4">
            To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p className="mb-4">
            You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          <p className="mb-4">
            We reserve the right to suspend or terminate your account if any information provided during the registration process or thereafter proves to be inaccurate, not current, or incomplete.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">4. Escrow Service</h2>
          <p className="mb-4">
            PayUnlock provides an escrow service to facilitate transactions between Buyers and Sellers. When a Buyer purchases a Digital Product, the payment is held in escrow until the Buyer confirms receipt and satisfaction with the Digital Product.
          </p>
          <p className="mb-4">
            Funds held in escrow will be released to the Seller only after the Buyer confirms receipt and satisfaction with the Digital Product, or after a specified period has elapsed without a dispute being raised by the Buyer.
          </p>
          <p className="mb-4">
            In the event of a dispute, PayUnlock reserves the right to make a final determination regarding the release of funds held in escrow, based on the evidence provided by both parties.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">5. Fees and Payments</h2>
          <p className="mb-4">
            PayUnlock charges a fee of 5% on all successful transactions. This fee is deducted from the payment to the Seller.
          </p>
          <p className="mb-4">
            All payments must be made through the payment methods supported by PayUnlock. We do not accept payments outside of our platform for transactions initiated on our platform.
          </p>
          <p className="mb-4">
            All prices are in US Dollars unless otherwise specified.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">6. Seller Obligations</h2>
          <p className="mb-4">
            Sellers must provide accurate and complete information about the Digital Products they offer for sale.
          </p>
          <p className="mb-4">
            Sellers must deliver the Digital Products as described and in a timely manner after receiving payment.
          </p>
          <p className="mb-4">
            Sellers must not offer for sale any Digital Products that violate any laws, regulations, or third-party rights, including intellectual property rights.
          </p>
          <p className="mb-4">
            Sellers are responsible for ensuring that they have the right to sell the Digital Products they offer on the Service.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">7. Buyer Obligations</h2>
          <p className="mb-4">
            Buyers must provide accurate payment information and have sufficient funds to complete the purchase.
          </p>
          <p className="mb-4">
            Buyers must verify the receipt and functionality of Digital Products in a timely manner.
          </p>
          <p className="mb-4">
            Buyers must not use the Digital Products in any way that violates any laws, regulations, or third-party rights.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">8. Dispute Resolution</h2>
          <p className="mb-4">
            In the event of a dispute between a Buyer and a Seller, the parties should first attempt to resolve the dispute directly.
          </p>
          <p className="mb-4">
            If the parties cannot resolve the dispute, either party may open a dispute through the Service within 7 days of the transaction.
          </p>
          <p className="mb-4">
            PayUnlock will review the evidence provided by both parties and make a final determination regarding the release of funds held in escrow.
          </p>
          <p className="mb-4">
            PayUnlock's decision in all disputes is final and binding.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, PayUnlock shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses, resulting from:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Your use of or inability to use the Service;</li>
            <li>Any unauthorized access to or use of our servers and/or any personal information stored therein;</li>
            <li>Any interruption or cessation of transmission to or from the Service;</li>
            <li>Any bugs, viruses, trojan horses, or the like that may be transmitted to or through the Service by any third party;</li>
            <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the Service.</li>
          </ul>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">10. Changes to Terms and Conditions</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms and Conditions at any time. If we make changes, we will provide notice by posting the updated Terms and Conditions on the Service and updating the "Last updated" date at the top of these Terms and Conditions.
          </p>
          <p className="mb-4">
            Your continued use of the Service after the posting of the updated Terms and Conditions constitutes your acceptance of the changes.
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about these Terms and Conditions, please contact us at:
          </p>
          <p className="mb-4">
            Email: support@payunlock.com<br />
            Address: 123 Secure Street, Digital City, DC 12345
          </p>
        </div>
      </div>
    </Layout>
  );
}
