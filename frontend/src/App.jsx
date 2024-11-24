import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import your contract ABI
// Note: You'll need to copy the contract artifacts from the hardhat project
const contractABI = [
  "function seller() view returns (address)",
  "function price() view returns (uint256)",
  "function setPrice(uint256 _newPrice) external",
  "function getBalance() view returns (uint256)",
  "function pay(uint256 _toPay) external"
];

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [contract, setContract] = useState(null);
  const [currentPrice, setCurrentPrice] = useState('0');
  const [newPrice, setNewPrice] = useState('');
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      // Add Hardhat network if it doesn't exist
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x7A69',
            chainName: 'Hardhat Local',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['http://localhost:8545']
          }]
        });
      } catch (addError) {
        console.log('Network might already be added');
      }

      // Switch to Hardhat network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Initialize contract
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      // Check if connected wallet is seller
      const sellerAddress = await contractInstance.seller();
      setIsSeller(sellerAddress.toLowerCase() === address.toLowerCase());

      setContract(contractInstance);
      await updateContractInfo(contractInstance);

      setSuccess('Wallet connected successfully!');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const updateContractInfo = async (contractInstance) => {
    try {
      const price = await contractInstance.price();
      setCurrentPrice(ethers.formatEther(price));

      if (isSeller) {
        const balance = await contractInstance.getBalance();
        setBalance(ethers.formatEther(balance));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSetPrice = async () => {
    try {
      if (!contract || !newPrice) return;

      const priceInWei = ethers.parseEther(newPrice);
      const tx = await contract.setPrice(priceInWei);
      await tx.wait();

      await updateContractInfo(contract);
      setSuccess('Price updated successfully!');
      setNewPrice('');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  const handlePay = async () => {
    try {
      if (!contract) return;

      const price = await contract.price();
      const tx = await contract.pay(price);
      await tx.wait();

      await updateContractInfo(contract);
      setSuccess('Payment successful!');
      setError('');
    } catch (err) {
      setError(err.message);
      setSuccess('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Contract Interface (Hardhat)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button onClick={connectWallet}>
              Connect Wallet
            </Button>
            {walletAddress && (
              <p className="text-sm">Connected Address: {walletAddress}</p>
            )}
          </div>

          {contract && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Current Price</h3>
                <p>{currentPrice} ETH</p>
              </div>

              {isSeller && (
                <>
                  <div>
                    <h3 className="font-medium">Balance</h3>
                    <p>{balance} ETH</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">Set New Price</h3>
                    <Input
                      type="number"
                      placeholder="New price in ETH"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                    <Button onClick={handleSetPrice}>
                      Set Price
                    </Button>
                  </div>
                </>
              )}

              <div>
                <Button onClick={handlePay}>
                  Pay Current Price
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;