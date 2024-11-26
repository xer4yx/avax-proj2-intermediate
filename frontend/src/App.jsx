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
  "function getBalance() external view returns (uint256)",
  "function pay(uint256 _toPay) external"
];

function App() {
  const [account, setAccount] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [contract, setContract] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const connectWallet = async () => {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        // Set the first account
        setAccount(accounts[0]);
        
        // Initialize contract after connecting wallet
        await initializeContract(accounts[0]);
      } else {
        alert('MetaMask not detected. Please install MetaMask.');
      }
    } catch (err) {
      alert(err.message || 'Failed to connect wallet');
    }
  };

  const initializeContract = async (address) => {
    try {
      // Create provider from MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractABI,
        signer
      );

      const sellerAddress = await contractInstance.seller();
      setIsSeller(sellerAddress.toLowerCase() === address.toLowerCase());
      setContract(contractInstance);
      alert('Connected successfully!');
      await updateContractInfo(contractInstance);
    } catch (err) {
      alert(err.message || 'An unknown error occurred.');
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
      alert(err.message || 'Failed to fetch contract data.');
    }
  };

  const handleSetPrice = async () => {
    try {
      if (!contract || !newPrice) {
        alert('Price input is empty.');
        return;
      }

      const tx = await contract.setPrice(ethers.parseEther(newPrice));
      await tx.wait();

      await updateContractInfo(contract);
      alert('Price updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to set price.');
    }
  };

  const handlePay = async () => {
    try {
      if (!contract) {
        alert('Contract is not initialized.');
        return;
      }

      const price = await contract.price();
      const tx = await contract.pay(price);
      await tx.wait();

      await updateContractInfo(contract);
      alert('Payment successful!');
    } catch (err) {
      alert(err.message || 'Payment failed.');
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          initializeContract(accounts[0]);
        } else {
          // Disconnected
          setAccount('');
          setContract(null);
        }
      });
    }

    // Cleanup listener
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Contract Interface</CardTitle>
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

          {!account ? (
            <div className="text-center">
              <Button onClick={connectWallet}>Connect Wallet</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center">Connected: {account}</p>
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
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                    />
                    <Button onClick={handleSetPrice}>Set Price</Button>
                  </div>
                </div>
              )}

              <div className="text-center">
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