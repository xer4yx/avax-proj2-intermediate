import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Import your contract ABI
const contractABI = [
  "function seller() view returns (address)",
  "function price() view returns (uint256)",
  "function setPrice(uint256 _newPrice) external",
  "function getBalance() view returns (uint256)",
  "function pay(uint256 _toPay) external"
];

function App() {
  const [addressInput, setAddressInput] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [contract, setContract] = useState(null);
  const [currentPrice, setCurrentPrice] = useState('0');
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  // Replace with your deployed contract address
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const initializeContract = async (address) => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = provider.getSigner(address);
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const sellerAddress = await contractInstance.getAddress();
      setIsSeller(sellerAddress === address);
      setContract(contractInstance);
      setSuccess('Logged in successfully!');
      setError('');
      setLoggedIn(true);
      await updateContractInfo(contractInstance);
    } catch (err) {
      setError(toString(err));
      setSuccess('');
    }
  };

  const updateContractInfo = async (contractInstance) => {
    try {
      const price = await contractInstance.price;
      setCurrentPrice(ethers.formatEther(price));

      if (isSeller) {
        const balance = await contractInstance.getBalance();
        setBalance(ethers.formatEther(balance));
      }
    } catch (err) {
      // setError('Failed to fetch contract data.');
      setError(toString(err));
    }
  };

  const handleLogin = () => {
    if (!ethers.isAddress(addressInput)) {
      setError('Invalid Ethereum address.');
      return;
    }
    initializeContract(addressInput);
  };

  const handleSetPrice = async (newPrice) => {
    try {
      if (!contract || !newPrice) return;

      const priceInWei = ethers.parseEther(newPrice);
      const tx = await contract.setPrice(priceInWei);
      await tx.wait();

      await updateContractInfo(contract);
      setSuccess('Price updated successfully!');
      setError('');
    } catch (err) {
      // setError('Failed to set price.');
      setError(toString(err));
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
      setError('Payment failed.');
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

          {!loggedIn ? (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your Ethereum address"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
              />
              <Button onClick={handleLogin}>Login</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Logged in as: {addressInput}</p>
              <div>
                <h3 className="font-medium">Current Price</h3>
                <p>{currentPrice} ETH</p>
              </div>

              {isSeller && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Balance</h3>
                    <p>{balance} ETH</p>
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="New price in ETH"
                      onChange={(e) => handleSetPrice(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div>
                <Button onClick={handlePay}>Pay Current Price</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
