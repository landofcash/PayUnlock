import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "../components/Layout";

type OrderStatus = "pending" | "delivered" | "disputed" | "completed" | "refunded";

interface Order {
  id: string;
  productTitle: string;
  buyer: string;
  seller: string;
  price: string;
  status: OrderStatus;
  purchaseDate: string;
  deliveryDate?: string;
  hasDispute: boolean;
}

export function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get("filter");

  const [filter, setFilter] = useState<string>(filterParam || "all");
  const [searchTerm, setSearchTerm] = useState("");

  // This would typically fetch data from an API
  const mockOrders: Order[] = [
    {
      id: "301",
      productTitle: "Windows 11 Pro License",
      buyer: "john.doe@example.com",
      seller: "TechKeys",
      price: "120",
      status: "pending",
      purchaseDate: "2025-08-04",
      hasDispute: false
    },
    {
      id: "302",
      productTitle: "Adobe Creative Cloud 1-Year",
      buyer: "jane.smith@example.com",
      seller: "SoftwarePlus",
      price: "240",
      status: "delivered",
      purchaseDate: "2025-08-03",
      deliveryDate: "2025-08-03",
      hasDispute: false
    },
    {
      id: "303",
      productTitle: "Office 365 Family Plan",
      buyer: "robert.johnson@example.com",
      seller: "MSPartner",
      price: "99",
      status: "completed",
      purchaseDate: "2025-08-02",
      deliveryDate: "2025-08-02",
      hasDispute: false
    },
    {
      id: "304",
      productTitle: "Game Key - Latest RPG",
      buyer: "gamer123@example.com",
      seller: "GameDeals",
      price: "59",
      status: "disputed",
      purchaseDate: "2025-08-01",
      deliveryDate: "2025-08-01",
      hasDispute: true
    },
    {
      id: "305",
      productTitle: "VPN Service - 2 Years",
      buyer: "privacy.first@example.com",
      seller: "PrivacyNow",
      price: "79",
      status: "refunded",
      purchaseDate: "2025-07-30",
      hasDispute: true
    },
  ];

  // Filter orders based on selected filter and search term
  const filteredOrders = mockOrders.filter(order => {
    // Apply status filter
    if (filter === "disputed" && !order.hasDispute) return false;
    if (filter !== "all" && filter !== "disputed" && order.status !== filter) return false;

    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        order.productTitle.toLowerCase().includes(searchLower) ||
        order.buyer.toLowerCase().includes(searchLower) ||
        order.seller.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

  // Status badge color mapping
  const getStatusBadgeClass = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Orders Management</h1>
          <Link to="/admin" className="text-primary hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                All Orders
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === "pending" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("delivered")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === "delivered" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Delivered
              </button>
              <button
                onClick={() => setFilter("disputed")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === "disputed" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Disputed
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 rounded-full text-sm ${
                  filter === "completed" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                Completed
              </button>
            </div>

            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-input rounded-md"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">Order ID</th>
                  <th className="text-left p-4">Product</th>
                  <th className="text-left p-4">Buyer</th>
                  <th className="text-left p-4">Seller</th>
                  <th className="text-left p-4">Price</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Purchase Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-4">#{order.id}</td>
                    <td className="p-4">{order.productTitle}</td>
                    <td className="p-4">{order.buyer}</td>
                    <td className="p-4">{order.seller}</td>
                    <td className="p-4">${order.price}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {order.hasDispute && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" title="Has dispute"></span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">{order.purchaseDate}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="text-sm bg-secondary text-secondary-foreground px-2 py-1 rounded hover:bg-secondary/90 transition-colors">
                          View
                        </button>
                        {order.hasDispute && (
                          <button className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded hover:bg-red-200 transition-colors">
                            Resolve
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors">
                            Remind
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No orders found matching your criteria</p>
            </div>
          )}
        </div>

        <div className="bg-muted p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Export Orders Data
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
              Send Bulk Notifications
            </button>
            <button className="bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors">
              Resolve All Timeouts
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
