import { percentAmount, generateSigner, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi'
import { TokenStandard, createAndMint } from '@metaplex-foundation/mpl-token-metadata'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import "@solana/web3.js";
import dotenv from 'dotenv';
dotenv.config();

import secret from './privateKey.json';

const umi = createUmi(String(process.env.RPC_URL));

const userWallet = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const userWalletSigner = createSignerFromKeypair(umi, userWallet);

const metadata = {
  name: String(process.env.TOKEN_NAME),
  symbol: String(process.env.TOKEN_SYMBOL),
  uri: String(process.env.TOKEN_METADATA_URI),
};

const mint = generateSigner(umi);
umi.use(signerIdentity(userWalletSigner));
umi.use(mplCandyMachine())

const decimals = Number(process.env.TOKEN_DECIMAL);
const amount = Number(process.env.TOKEN_INITIAL_SUPPLY) * (Math.pow(10, decimals));

createAndMint(umi, {
  mint,
  authority: umi.identity,
  name: metadata.name,
  symbol: metadata.symbol,
  uri: metadata.uri,
  sellerFeeBasisPoints: percentAmount(0),
  decimals: decimals,
  amount: amount,
  tokenOwner: userWallet.publicKey,
  tokenStandard: TokenStandard.Fungible,
}).sendAndConfirm(umi).then(() => {
  console.log(`Successfully minted ${process.env.TOKEN_INITIAL_SUPPLY} million tokens (`, mint.publicKey, ")");
});
