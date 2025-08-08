# PayUnlock Smart Contract

PayUnlock is a decentralized marketplace for secure digital content transactions on the Hedera network. It implements an escrow system that facilitates secure transactions between content sellers and buyers using advanced cryptography.

## Overview

PayUnlock enables content creators to sell digital content securely by:
1. Encrypting the content with a symmetric key
2. Storing the encrypted content on Hedera File Service (HFS)
3. Listing the content for sale with a specified price in HBAR or tokens
4. Securely transferring the decryption key to buyers after payment

The smart contract acts as a trustless escrow, holding the buyer's payment until the seller provides the decryption key, protecting both parties in the transaction.

## Features

- **Secure Key Exchange**: Uses Elliptic Curve Integrated Encryption Scheme (ECIES) for secure key exchange
- **Multiple Payment Options**: Supports both HBAR and ERC-20/HTS tokens
- **Escrow System**: Holds funds until transaction is completed
- **Time-boxed Transactions**: Enforces time limits for each stage of the transaction
- **Refund Mechanism**: Automatically enables refunds if seller doesn't deliver
- **Confirmation System**: Allows buyers to confirm receipt of decryption key

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Hedera account with ECDSA keys
- Access to Hedera network (Local, Testnet, Previewnet, or Mainnet)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/payunlock-contract.git
   cd payunlock-contract
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the example:
   ```
   cp example.env .env
   ```

4. Configure your `.env` file with your Hedera account information:
   - Add your ECDSA private key for the desired network
   - Configure the endpoint URLs if needed

## Usage

### Compiling the Contract

```
npm run compile
```

### Running a Local Node

```
npm run local-node
```

### Running Tests

```
npm run test
```

### Deploying to Testnet

```
npm run deploy-testnet
```

## Contract Functionality

### For Sellers

1. **Create Product**:
   - Set price and currency
   - Provide file ID from Hedera File Service
   - Supply seller's public key and encrypted symmetric key

2. **Send Code**:
   - After purchase, re-encrypt the symmetric key with buyer's public key
   - Send the re-encrypted key to the contract

3. **Withdraw Funds**:
   - After buyer confirmation or timeout, withdraw funds from escrow

### For Buyers

1. **Purchase Product**:
   - Pay with HBAR or tokens
   - Provide buyer's public key for secure key exchange

2. **Confirm Receipt**:
   - After receiving and verifying the decryption key, confirm completion

3. **Request Refund**:
   - If seller doesn't provide the key within the time window, request a refund

## Contract States

The contract implements a state machine with the following states:

1. **Initial**: Product is listed but not yet purchased
2. **Paid**: Buyer has paid and funds are in escrow
3. **CodeSent**: Seller has sent the re-encrypted key to the buyer
4. **Completed**: Buyer has confirmed receipt of the key
5. **CompletedPaidout**: Seller has withdrawn the funds
6. **Refunded**: Transaction was refunded to the buyer

## Time Windows

The contract enforces two time windows:

1. **Send Code Window** (3 days): Time the seller has to send the re-encrypted key after purchase
2. **Confirm Window** (5 days): Time the buyer has to confirm receipt after the key is sent

## Development

### Project Structure

- `contracts/`: Smart contract source code
- `scripts/`: Deployment and interaction scripts
- `test/`: Test files
- `hardhat.config.js`: Hardhat configuration

### Configuration

The project supports multiple Hedera networks:

- **Local**: For local development using Hedera Local Node
- **Testnet**: For testing on Hedera Testnet
- **Previewnet**: For testing on Hedera Previewnet (commented out by default)
- **Mainnet**: For production deployment (commented out by default)

## Security Considerations

- The contract includes a reentrancy guard to prevent reentrancy attacks
- Funds are held in escrow until transaction completion or refund
- Time windows protect both buyers and sellers from malicious behavior
- The contract does not store the actual content, only facilitates the secure exchange of decryption keys

## Disclaimer

This software is provided "as is", without warranty of any kind. Use at your own risk.
