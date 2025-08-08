import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Page components
import { HomePage } from './pages/HomePage'
import { OffersPage } from './pages/OffersPage'
import { OfferDetailsPage } from './pages/OfferDetailsPage'
import { NewProductPage} from './pages/NewProductPage'
import { MyOffersPage } from './pages/MyOffersPage'
import { MyPurchasesPage } from './pages/MyPurchasesPage'
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

        {/* Buyer pages */}
        <Route path="/my-purchases" element={<MyPurchasesPage />} />

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
