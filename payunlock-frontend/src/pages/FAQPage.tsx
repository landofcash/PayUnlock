import { useState } from "react";
import { Layout } from "../components/Layout";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [searchTerm, setSearchTerm] = useState("");

  const faqItems: FAQItem[] = [
    {
      question: "What is PayUnlock?",
      answer: "PayUnlock is a secure marketplace for digital keys and licenses. It provides escrow protection for buyers and sellers, ensuring safe transactions for digital products.",
      category: "general"
    },
    {
      question: "How does the escrow system work?",
      answer: "When a buyer purchases a product, the payment is held in escrow. The seller then delivers the product key or license. Once the buyer confirms receipt and satisfaction, the funds are released to the seller.",
      category: "general"
    },
    {
      question: "Is my payment information secure?",
      answer: "Yes, PayUnlock uses industry-standard encryption and security measures to protect your payment information. We never store your full credit card details on our servers.",
      category: "general"
    },
    {
      question: "How do I sell my digital products?",
      answer: "To sell digital products, create an account, verify your identity, and then click on 'Create Offer' to list your product. You'll need to provide details about the product, set a price, and specify any terms of use.",
      category: "sellers"
    },
    {
      question: "What fees does PayUnlock charge?",
      answer: "PayUnlock charges a 5% fee on successful transactions. There are no listing fees or monthly charges. The fee is deducted from the final payment to the seller.",
      category: "sellers"
    },
    {
      question: "How quickly will I receive my payment?",
      answer: "Once a buyer confirms receipt and satisfaction with the product, funds are released from escrow within 24 hours. The time it takes for the funds to appear in your account depends on your payment method.",
      category: "sellers"
    },
    {
      question: "How do I know if a product key is legitimate?",
      answer: "All sellers on PayUnlock are verified, and our escrow system protects you from fraud. Additionally, you can verify the integrity of digital products using our hash verification tool if the seller provides a hash.",
      category: "buyers"
    },
    {
      question: "What if the product key doesn't work?",
      answer: "If you receive a product key that doesn't work, you can open a dispute within 7 days of purchase. Our team will investigate and help resolve the issue. If the key is indeed invalid, you'll receive a refund.",
      category: "buyers"
    },
    {
      question: "Can I get a refund after confirming receipt?",
      answer: "Once you confirm receipt and satisfaction with a product, the funds are released to the seller and refunds are generally not possible. Make sure to verify that the product works before confirming receipt.",
      category: "buyers"
    },
    {
      question: "How do I open a dispute?",
      answer: "To open a dispute, go to 'My Purchases', find the order in question, and click on 'Open Dispute'. You'll need to provide details about the issue and any relevant evidence.",
      category: "disputes"
    },
    {
      question: "How long does dispute resolution take?",
      answer: "Most disputes are resolved within 3-5 business days. Complex cases may take longer. During the dispute process, the funds remain in escrow until a resolution is reached.",
      category: "disputes"
    },
    {
      question: "What happens if a dispute is decided in my favor?",
      answer: "If a dispute is decided in your favor as a buyer, you'll receive a full refund. If you're a seller and the dispute is decided in your favor, the funds will be released to you from escrow.",
      category: "disputes"
    },
  ];

  const categories = [
    { id: "general", name: "General Questions" },
    { id: "buyers", name: "For Buyers" },
    { id: "sellers", name: "For Sellers" },
    { id: "disputes", name: "Disputes & Resolution" },
  ];

  // Filter FAQ items based on active category and search term
  const filteredFAQs = faqItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = searchTerm === "" ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

        <div className="mb-8">
          <input
            type="text"
            placeholder="Search FAQ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-input rounded-md"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-md text-sm ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            All Categories
          </button>

          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-md text-sm ${
                activeCategory === category.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredFAQs.map((faq, index) => (
            <div key={index} className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">{faq.question}</h2>
              <p className="text-muted-foreground">{faq.answer}</p>
              <div className="mt-4">
                <span className="inline-block px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                  {categories.find(cat => cat.id === faq.category)?.name || faq.category}
                </span>
              </div>
            </div>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12 bg-card rounded-lg shadow-md">
              <p className="text-muted-foreground mb-4">No FAQ items found matching your criteria</p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchTerm("");
                }}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Still Have Questions?</h2>
          <p className="mb-4">
            If you couldn't find the answer to your question, please contact our support team.
          </p>
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </Layout>
  );
}
