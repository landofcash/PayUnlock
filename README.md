# PayUnlock - Secure Digital Marketplace on Hedera

PayUnlock is a decentralized escrow marketplace for digital products, powered by Hedera blockchain technology. It provides a secure platform for buying and selling digital content with built-in protection for both parties through smart contract escrow.

## Project Description

PayUnlock is redefining digital commerce by removing intermediaries and guaranteeing secure delivery of digital products. Powered by advanced cryptography and Hedera smart contracts, it creates a trustless environment where buyers can verify content before payment is released. This DeFi-driven model brings practical, real-world use cases to blockchain, with security, transparency, and a seamless user experience at its core.

## Tech Stack

### Frontend
- **React 19** - Modern UI library for building the user interface
- **TypeScript** - Type-safe JavaScript for improved developer experience
- **Vite** - Next-generation frontend build tool
- **TailwindCSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Unstyled, accessible UI components

### Blockchain & Cryptography
- **Hedera Blockchain** - Fast, secure, and energy-efficient public ledger
- **@reown/appkit** - SDK for Hedera integration
- **Wagmi** - React hooks for Ethereum/Hedera
- **Viem** - TypeScript interface for Ethereum/Hedera

### Encryption 
- **ECIES** - Elliptic Curve Integrated Encryption Scheme for asymmetric encryption
- **AES-GCM** - Advanced Encryption Standard with Galois/Counter Mode for symmetric encryption

## Key Features
- 
- **End-to-End Encryption**: All digital content is encrypted to protect both buyers and sellers
- **Secure Escrow System**: Payments are held in a Hedera smart contract until delivery is confirmed
- **Wallet Integration**: Seamless connection with Hedera wallets
- **Hybrid Encryption**: Combines symmetric and asymmetric encryption for optimal security and performance
- **Decentralized Delivery**: Content delivery happens directly between seller and buyer without intermediaries

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Check config.ts   
4. Run the development server:
   ```
   npm run dev
   ```
5. Build for production:
   ```
   npm run build
   ```

## Usage

### For Buyers
- Browse available digital products
- Purchase using HBAR with funds held in escrow
- Receive and decrypt the digital content
- Confirm receipt to release payment to the seller

### For Sellers
- Create and list digital products
- Set prices in HBAR
- Deliver encrypted content to buyers
- Receive payment automatically once delivery is confirmed

## Hedera Hackathon - DeFi Track

This project was developed for the Hedera Hackathon, DeFi track. It demonstrates how blockchain technology can be applied to real-world financial transactions beyond traditional cryptocurrency use cases, creating a secure and efficient marketplace for digital goods.
