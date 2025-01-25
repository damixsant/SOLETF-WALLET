import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

const TOKEN_MINT_ADDRESS = "H2oFKYcWq5PgdFFjoBHjkSMJfoSzMh9Qf8DfbbJpump";

const WalletApp = () => {
    const [network] = useState(WalletAdapterNetwork.Mainnet);
    const endpoint = clusterApiUrl(network);
    const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletInterface />
            </WalletProvider>
        </ConnectionProvider>
    );
};

const WalletInterface = () => {
    const { publicKey, connect, disconnect } = useWallet();
    const [balance, setBalance] = useState(null);

    const fetchTokenBalance = async () => {
        if (!publicKey) return;

        const connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Mainnet));
        const tokenMintAddress = new PublicKey(TOKEN_MINT_ADDRESS);
        const tokenAccounts = await connection.getTokenAccountsByOwner(publicKey, {
            mint: tokenMintAddress,
        });

        if (tokenAccounts.value.length > 0) {
            const accountInfo = await connection.getParsedAccountInfo(tokenAccounts.value[0].pubkey);
            const balance = accountInfo.value.data.parsed.info.tokenAmount.uiAmount;
            setBalance(balance);
        } else {
            setBalance(0);
        }
    };

    const handleBuyCrypto = () => {
        window.open(
            `https://buy.ramp.network/?swapAsset=H2oFKYc&userAddress=${publicKey}`,
            "_blank"
        );
    };

    return (
        <div className="p-4 flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">H2oFKYc Wallet</h1>
            <Card className="w-full max-w-md mb-4">
                <CardContent>
                    {publicKey ? (
                        <div className="text-center">
                            <p className="mb-2">Connected Wallet:</p>
                            <p className="font-mono text-sm break-all">{publicKey.toString()}</p>
                            <Button className="mt-4 w-full" onClick={fetchTokenBalance}>
                                Check H2oFKYc Balance
                            </Button>
                            {balance !== null && (
                                <p className="mt-2 text-lg">Balance: {balance} H2oFKYc</p>
                            )}
                            <Button className="mt-4 w-full" onClick={disconnect}>
                                Disconnect
                            </Button>
                        </div>
                    ) : (
                        <Button className="w-full" onClick={connect}>
                            Connect Wallet
                        </Button>
                    )}
                </CardContent>
            </Card>

            {publicKey && (
                <Button className="w-full mt-4" onClick={handleBuyCrypto}>
                    Buy H2oFKYc with EUR
                </Button>
            )}
        </div>
    );
};

export default WalletApp;
