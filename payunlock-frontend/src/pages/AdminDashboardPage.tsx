import { Link } from "react-router-dom";
import { Layout } from "../components/Layout";

export function AdminDashboardPage() {
  // This would typically fetch data from an API
  const mockStats = {
    totalUsers: 1245,
    totalOffers: 876,
    activeOffers: 743,
    totalSales: 3254,
    pendingDisputes: 12,
    pendingOrders: 28,
    revenue: 45780,
    recentActivity: [
      { id: 1, type: "dispute", description: "New dispute opened for Order #203", time: "10 minutes ago" },
      { id: 2, type: "order", description: "New order #305 created", time: "25 minutes ago" },
      { id: 3, type: "user", description: "New user registered: john.doe@example.com", time: "1 hour ago" },
      { id: 4, type: "sale", description: "Sale completed for Windows 11 Pro License", time: "2 hours ago" },
      { id: 5, type: "dispute", description: "Dispute #198 resolved", time: "3 hours ago" },
    ]
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Total Users</h2>
            <p className="text-3xl font-bold">{mockStats.totalUsers}</p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Active Offers</h2>
            <p className="text-3xl font-bold">{mockStats.activeOffers}</p>
            <p className="text-sm text-muted-foreground">of {mockStats.totalOffers} total</p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Total Sales</h2>
            <p className="text-3xl font-bold">{mockStats.totalSales}</p>
          </div>

          <div className="bg-card rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-muted-foreground mb-2">Revenue</h2>
            <p className="text-3xl font-bold">${mockStats.revenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {mockStats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start border-b border-border pb-4">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      activity.type === 'dispute' ? 'bg-red-500' :
                      activity.type === 'order' ? 'bg-blue-500' :
                      activity.type === 'user' ? 'bg-green-500' : 'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1">
                      <p>{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Attention Required</h2>

              <div className="space-y-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-1">
                      <h3 className="font-semibold">Pending Orders</h3>
                      <p className="text-sm text-muted-foreground">Orders awaiting delivery</p>
                    </div>
                    <div className="text-2xl font-bold">{mockStats.pendingOrders}</div>
                  </div>
                  <div className="mt-2">
                    <Link
                      to="/admin/orders"
                      className="text-sm text-primary hover:underline"
                    >
                      View all pending orders
                    </Link>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-1">
                      <h3 className="font-semibold">Open Disputes</h3>
                      <p className="text-sm text-muted-foreground">Disputes requiring resolution</p>
                    </div>
                    <div className="text-2xl font-bold">{mockStats.pendingDisputes}</div>
                  </div>
                  <div className="mt-2">
                    <Link
                      to="/admin/orders?filter=disputed"
                      className="text-sm text-primary hover:underline"
                    >
                      View all disputes
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link
                  to="/admin/orders"
                  className="block w-full text-center bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  Manage Orders
                </Link>
                <button
                  className="block w-full text-center bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                >
                  Generate Reports
                </button>
                <button
                  className="block w-full text-center bg-muted text-muted-foreground px-4 py-2 rounded-md hover:bg-muted/90 transition-colors"
                >
                  System Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
