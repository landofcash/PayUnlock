# PayUnlock - Secure Decentralized Digital Marketplace on Hedera

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC.svg)](https://tailwindcss.com/)
[![Hedera](https://img.shields.io/badge/Hedera-Powered-00C3F7.svg)](https://hedera.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**PayUnlock is a decentralized escrow marketplace for digital products, powered by Hedera technology. It provides a secure platform for buying and selling digital content with built-in protection for both parties through smart contract escrow.**

## 🚀 Project Overview

PayUnlock is redefining digital commerce by removing intermediaries and guaranteeing secure delivery of digital products. Powered by advanced cryptography and Hedera smart contracts, it creates a trustless environment where buyers can verify content before payment is released. This DeFi-driven model brings practical, real-world use cases to Hedera, with security, transparency, and a seamless user experience at its core.

### 🔑 Key Features

- **End-to-End Encryption**: All digital content is encrypted to protect both buyers and sellers
- **Secure Escrow System**: Payments are held in a Hedera smart contract until delivery is confirmed
- **Wallet Integration**: Seamless connection with Hedera wallets
- **Hybrid Encryption**: Combines symmetric and asymmetric encryption for optimal security and performance
- **Decentralized Delivery**: Content delivery happens directly between seller and buyer without intermediaries
- **Multi-Network Support**: Works on both Hedera testnet and mainnet
- **User-Friendly Interface**: Modern, responsive design with intuitive user experience

## 🏗️ Architecture

PayUnlock implements a sophisticated architecture that combines Hedera technology with advanced cryptography to create a secure and trustless marketplace for digital products.

### System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │◄────┤  Hedera Network │◄────┤  Smart Contract │
│                 │     │                 │     │                 │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │                                               ▲
         │                                               │
         ▼                                               │
┌─────────────────┐                           ┌─────────────────┐
│                 │                           │                 │
│  Encryption     │                           │  File Storage   │
│  Services       │                           │  (CDN) OR       │
│                 │                           │  Hedera Files   │
└─────────────────┘                           └─────────────────┘
```

### Security Flow

1. **Product Creation**:
   - Seller creates a product and encrypts it with AES-GCM (symmetric encryption)
   - The AES key is encrypted with the seller's public key using ECIES (asymmetric encryption)
   - Product metadata and encrypted content are stored in a CDN

2. **Purchase Process**:
   - Buyer initiates purchase and generates a key pair derived from their wallet
   - Payment is sent to the smart contract escrow
   - Buyer's public key is registered with the purchase

3. **Content Delivery**:
   - Seller decrypts the AES key with their private key
   - Seller re-encrypts the AES key with the buyer's public key
   - Encrypted key is sent to the buyer via the smart contract

4. **Content Access**:
   - Buyer decrypts the AES key with their private key
   - Buyer uses the AES key to decrypt the product content
   - After verifying the content, buyer confirms receipt to release payment

This architecture ensures that:
- Content is always encrypted during transmission
- Only the legitimate buyer can access the content
- Payment is only released after successful delivery
- The entire process is trustless and doesn't require intermediaries

## 🛠️ Tech Stack

### Frontend
- **React 19**: Latest version of React with improved performance and features
- **TypeScript**: Type-safe JavaScript for improved developer experience and code quality
- **Vite**: Next-generation frontend build tool for faster development and optimized production builds
- **TailwindCSS**: Utility-first CSS framework for rapid UI development
- **Shadcn UI**: Unstyled, accessible UI components built with Radix UI and Tailwind CSS

### Hedera Integration
- **@reown/appkit**: SDK for seamless Hedera integration
- **Wagmi**: React hooks for Ethereum/Hedera wallet integration
- **Viem**: TypeScript interface for Ethereum/Hedera blockchain interaction

### Encryption & Security
- **ECIES**: Elliptic Curve Integrated Encryption Scheme for asymmetric encryption
- **AES-GCM**: Advanced Encryption Standard with Galois/Counter Mode for symmetric encryption
- **Web Crypto API**: Browser-based cryptographic operations
- **Elliptic**: JavaScript implementation of elliptic curve cryptography

## 📁 Project Structure

```
payunlock-frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images and other assets
│   ├── components/         # Reusable UI components
│   │   ├── ui/             # Base UI components
│   │   └── ...             # Feature-specific components
│   ├── contracts/          # Smart contract ABIs
│   ├── pages/              # Page components
│   │   ├── HomePage.tsx
│   │   ├── OffersPage.tsx
│   │   ├── OfferDetailsPage.tsx
│   │   ├── NewProductPage.tsx
│   │   ├── MyOffersPage.tsx
│   │   ├── MyPurchasesPage.tsx
│   │   └── Debug/          # Debug pages
│   ├── utils/              # Utility functions
│   │   ├── encryption.ts   # Encryption utilities
│   │   ├── keygen.ts       # Key generation utilities
│   │   ├── encoding.ts     # Encoding utilities
│   │   └── productUtils.ts # Product-related utilities
│   ├── App.tsx             # Main application component
│   ├── config.ts           # Application configuration
│   └── main.tsx            # Application entry point
├── tailwind.config.js      # TailwindCSS configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies and scripts
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Hedera wallet (HashPack, Blade, or MetaMask with Hedera support)
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/payunlock-frontend.git
   cd payunlock-frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Configure the application
   - Review `src/config.ts` for network settings
   - By default, the application connects to Hedera testnet

4. Run the development server
   ```bash
   npm run dev
   ```

5. Build for production
   ```bash
   npm run build
   ```

6. Preview the production build
   ```bash
   npm run preview
   ```

## 🧑‍💻 Usage Guide

### For Buyers

1. **Browse Products**
   - Visit the "All Products" page to see available digital products
   - Click on a product to view its details

2. **Purchase a Product**
   - Connect your Hedera wallet using the "Connect Wallet" button
   - On the product details page, click "Buy"
   - Follow the guided process to:
     - Sign a message to generate encryption keys
     - Confirm the purchase transaction
   - Your payment will be held in escrow until you receive the product

3. **Access Your Purchase**
   - After the seller provides the access code, visit "My Purchases"
   - Click on your purchased product
   - Click "Confirm & View Content" to:
     - Decrypt the content using your wallet-derived keys
     - View the digital product
     - Confirm receipt to release payment to the seller

### For Sellers

1. **Create a Product**
   - Connect your Hedera wallet
   - Click "Sell" in the navigation menu
   - Fill in the product details (name, description, price)
   - Upload your digital content
   - The content will be automatically encrypted before upload
   - Submit the product to list it on the marketplace

2. **Manage Your Products**
   - Visit "My Products" to see your listed products
   - Monitor sales and pending deliveries

3. **Deliver Products**
   - When a product is sold, you'll see it in "My Products" with a "Send Access Code" button
   - Click the button to:
     - Sign a message to access your encryption keys
     - Encrypt the product key for the specific buyer
     - Send the encrypted key to the buyer via the smart contract
   - Once the buyer confirms receipt, the payment will be released to your wallet

## 🔄 Transaction Flow

1. **Listing**: Seller encrypts and lists a digital product with a price in HBAR
2. **Purchase**: Buyer sends HBAR to the smart contract escrow
3. **Delivery**: Seller sends the encrypted access key to the buyer
4. **Confirmation**: Buyer decrypts and verifies the content, then confirms receipt
5. **Settlement**: Smart contract releases the payment to the seller


## 🔮 Future Roadmap

- **Multi-token Support**: Enable purchases with various Hedera tokens
- **Dispute Resolution**: Add a decentralized dispute resolution mechanism
- **Mobile App**: Develop a mobile application
- **Enhanced Analytics**: Provide sellers with detailed sales analytics
- **Social Features**: Add reviews, ratings, and social sharing capabilities
- **NFT Integration**: Support for NFT-based digital products and licenses

## 🙏 Acknowledgements

- [Hedera](https://hedera.com/) for providing the crypto infrastructure
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [TailwindCSS](https://tailwindcss.com/) for the styling framework
- [Shadcn UI](https://ui.shadcn.com/) for the UI components
- [ECIES](https://github.com/ecies/js) for the encryption library
- All contributors who have helped shape this project

---

<div align="center">
  <p>Built with ❤️ for the Hedera Hackathon - DeFi Track</p>
  <p>© 2025 PayUnlock. All rights reserved.</p>
</div>
