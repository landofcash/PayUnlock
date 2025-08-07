import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Page components
import { HomePage } from './pages/HomePage'
import { OffersPage } from './pages/OffersPage'
import { OfferDetailsPage } from './pages/OfferDetailsPage'
import { NewProductPage} from './pages/NewProductPage'
import { MyOffersPage } from './pages/MyOffersPage'
import { SendKeyPage } from './pages/SendKeyPage'
import { MyPurchasesPage } from './pages/MyPurchasesPage'
import { PurchaseDetailsPage } from './pages/PurchaseDetailsPage'
import { DisputePage } from './pages/DisputePage'
import { VerifyPage } from './pages/VerifyPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminOrdersPage } from './pages/AdminOrdersPage'
import { FAQPage } from './pages/FAQPage'
import { TermsPage } from './pages/TermsPage'
import {WalletSignDebugPage} from "@/pages/Debug/WalletSignDebugPage.tsx";
import TestAppKitPage from './pages/Debug/TestAppKitPage'
import CreateProductDebug from "@/pages/Debug/CreateProductDebug.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home page */}
        <Route path="/" element={<HomePage />} />

        {/* Public offer pages */}
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/offer/:id" element={<OfferDetailsPage />} />

        {/* Seller pages */}
        <Route path="/create" element={<NewProductPage />} />
        <Route path="/my-offers" element={<MyOffersPage />} />
        <Route path="/send-key/:id" element={<SendKeyPage />} />

        {/* Buyer pages */}
        <Route path="/my-purchases" element={<MyPurchasesPage />} />
        <Route path="/purchase/:id" element={<PurchaseDetailsPage />} />

        {/* Dispute and verification pages */}
        <Route path="/dispute/:id" element={<DisputePage />} />
        <Route path="/verify" element={<VerifyPage />} />

        {/* Admin pages */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/orders" element={<AdminOrdersPage />} />

        {/* Info pages */}
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/terms" element={<TermsPage />} />

        <Route path="/debug/wallet-sign" element={<WalletSignDebugPage />} />
        <Route path="/debug/test-contract" element={<TestAppKitPage />} />
        <Route path="/debug/test-create" element={<CreateProductDebug />} />


        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
