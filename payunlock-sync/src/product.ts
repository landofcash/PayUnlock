/**
 * Product box data for variant 2 (on-chain data)
 */
export interface Product
{
  seed: string;
  name: string;
  description: string;
  tokenId: string;
  price: string;
  encryptedPayload: string;
  encryptedKey: string;
  publicKey: string;
}
