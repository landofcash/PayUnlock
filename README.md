# PayUnlock - Secure Digital Marketplace on Hedera network.

PayUnlock is a decentralized escrow marketplace for digital products, powered by Hedera network technology. It provides a secure platform for buying and selling digital content with built-in protection for both parties through smart contract escrow.

There is no database or server side storage other than Hedera contracts and encrypted metadata files.

## Project Description

PayUnlock is redefining digital commerce by removing intermediaries and guaranteeing secure delivery of digital products. Powered by advanced cryptography and Hedera smart contracts, it creates a trustless environment where buyers can verify content before payment is released. This DeFi-driven model brings practical, real-world use cases to hashgraph, with security, transparency, and a seamless user experience at its core.

## Project Structure

- **Frontend** - React SPA is in payunlock-frontend folder
- **Smart Contract** - Hedera Smart Contract is in payunlock-contract folder
- **Sync Service** - Basic caching service is in payunlock-sync folder

--

- **NO BACKEND** - PayUnlock is fully decentralized solution.  

## Encryption Flow
**Seller: Initial Product Creation, (New Product Action)**
![](https://i.gyazo.com/cdb7f80840f6824a0a0fbed3926ec9a0.png)

**Buyer: Creation of the buyer public key, (Buy Action)**
![](https://i.gyazo.com/ce43ed1d7e894824329e53a225d97755.png)

**Seller: Encryption of the symmetric key for the buyer (send code action):**
![](https://i.gyazo.com/1efd1626cfbbc2f96665c7650baaabeb.png)

**Buyer: Open product payload (Complete action):**
![](https://i.gyazo.com/1e85ca2b12937bf0b495bac53b3c7ca0.png)

## Tech Stack

### Frontend
- **React 19** - Modern UI library for building the user interface
- **TypeScript** - Type-safe JavaScript for improved developer experience
- **Vite** - Next-generation frontend build tool
- **TailwindCSS** - Utility-first CSS framework for styling
- **Shadcn UI** - Unstyled, accessible UI components

### Hedera & Cryptography
- **Hedera hashgraph** - Fast, secure, and energy-efficient public ledger
- **@reown/appkit** - SDK for Hedera integration
- **Wagmi** - React hooks for Ethereum/Hedera
- **Viem** - TypeScript interface for Ethereum/Hedera

### Encryption 
- **ECIES** - Elliptic Curve Integrated Encryption Scheme for asymmetric encryption
- **AES-GCM** - Advanced Encryption Standard with Galois/Counter Mode for symmetric encryption

## Key Features
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

## Encryption Flow Diagram

https://kroki.io/mermaid/svg/eNqdVd9v2jAQfuevsFJpohLVYjuEEG3VGD-mai_VumkPqA8uMSUiOJltRtG0_31OfKFxmnbdeIHv7nz33Xdns87yw2rDpEZfZz2k9nf3khUbpPDSu-FZxiXiYiWPhU5zgRYmGPVTkeqUZefebQ_BR5Cl94WJJN-hG86TpidYesomuknvBdN7yZvu4dKbT6_mN-gzP6KCpbLppKesExvRdIZ9Q_G423Et0xWaW5be7fljxKhfJ-_wTpbeNTtmOXPYmrYhlieowx81_UAK9a1SjiBjU_sTF1wyzR1S2H_Wg43nmzJKXYli77aCSTkPngyQW35ryjPJkdK5NKZUILUrh7nKhZZspZ3eaEdzKFWNwwyt08zOh4ukuQ-kvQ9onUt0tz8ai-lfJGiaJ9yRAAeWs2MbntZBda0DHtUj23bsA45OE53xp_PG49dOh_hLr2OliEnwsWqp2N9lZqu2rp_6L22UoLizfpXxvEtUWpezF8v8dll2CEjC-kzndSKjl-4TiZ7pr8UrqMNA5dOy9Kf5rsi4ac8hSslTovTUXOegadAket2--MMXB03DvwldB44650wj5-3oLDHufB8C_7kHopKwEhldXCCvnA46pHrzThXM3Ep9zPj7giVJKu4vMr7W8SXcp-_MfOl3b8u4S88cvjRlbKqgTDXjMv3J0VqaZ1Bv-KOcNnRoQ6lFIXpj3r3KNAGL9YcWYYuGFtlAMbIosmhsEenBc2UhBYgrOAFUEfReaPH_VHDFwNAiHr5CDgw9YWgKQ1d43MIRtOnD1KpWTnzhZTtUrCASlCRhm0aLAgEKBCgQKEmAAq1L-i6mNbZDUlZqZZVXdsAKxkIJxMJcKMyfwubQAHC9HmELwwZQ4EqBKwWuFOShY9hE3_ErW14FPVCTfPiF1IYVPEaaP-jfYKbd5uDRLPkKzEaQOI6vU8EBYgMnP_asARveqBXcPhy08NjFtJWOtOJJKz9t5adhE68yptSMr1HJ16y5zLf84pAmehPj4mFQWxJmupaSHWORC16b47MgnM-m0aD8883is9l8sVgYtMqzXMZndBTNRxO3TFn438uQYUBpWJcho3AYTE5lFtXHTre8pkYyCFwswpnvOx56ymmdg-cizd44rl7vD9h7zeg=

## Hedera Hackathon - DeFi Track

This project was developed for the Hedera Hackathon, DeFi track. It demonstrates how Hedera technology can be applied to real-world financial transactions beyond traditional cryptocurrency use cases, creating a secure and efficient marketplace for digital goods.
