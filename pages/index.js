import { useState, useEffect } from "react";
import { ethers } from "ethers";
import blackbox_abi from "../artifacts/contracts/Blackbox.sol/Blackbox.json";

export default function HomePage() {
  const [metaWallet, setMetamaskWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [blackbox, setBlackboxGoods] = useState(undefined);
  const [illegalGoods, setIllegalGoods] = useState([]);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const blackboxABI = blackbox_abi.abi;

  const handleAccount = (account) => {
    if (account) {
      setAccount(account);
      alert("Notice: Metamask account has been connected!");
    } else {
      alert("No account found");
    }
  };

  const getWallet = async () => {
    if (window.ethereum) {
      setMetamaskWallet(window.ethereum);
    }

    if (metaWallet) {
      const account = await metaWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const getBlackBoxContract = async () => {
    const provider = new ethers.providers.Web3Provider(metaWallet);
    const signer = provider.getSigner();
    const lootContract = new ethers.Contract(contractAddress, blackboxABI, signer);

    setBlackboxGoods(lootContract);
  };

  const loginWallet = async () => {
    if (!metaWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await metaWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    await getBlackBoxContract();
  };

  const logoutWallet = async () => {
    try {
      setAccount(undefined);
      setBlackboxGoods(undefined);
      setIllegalGoods([]);

      alert("Logout from the session");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      alert("Error disconnecting wallet. Forcing you to logout");
    } finally {
      if (account) {
        setAccount(undefined);
      }
    }
  };

  const switchAccount = async () => {
    if (!metaWallet || !metaWallet.isMetaMask) {
      alert("MetaMask wallet is not available!");
      return;
    }

    try {
      await metaWallet.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }]
      });

      const accounts = await metaWallet.request({ 
        method: "eth_requestAccounts" 
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        
        const provider = new ethers.providers.Web3Provider(metaWallet);
        const signer = provider.getSigner();
        const lootContract = new ethers.Contract(contractAddress, blackboxABI, signer);
        
        setBlackboxGoods(lootContract);
        
        await getRewards();

        alert(`Switched to account: ${accounts[0]}`);
      }
    } catch (error) {
      console.error("Account switching error:", error);
      alert("Error switching accounts. Please try again.");
    }
  };

  const buyMelee = async () => {
    if (!blackbox) return;

    try {
      const tx = await blackbox.buyMelee({
        value: ethers.utils.parseEther("1"),
      });
      await tx.wait();
    } catch (error) {
      alert("transaction error", error);
      console.log(error);
    }
    getRewards();
  };

  const buyHandgun = async () => {
    if (!blackbox) return;

    try {
        const tx = await blackbox.buyHandgun({
            value: ethers.utils.parseEther("2"),
        });
        await tx.wait();
    } catch (error) {
        alert("transaction error", error)
        console.log(error);
    }

    getRewards();
  };

  const buyRifle = async () => {
    if (!blackbox) return;

    try {
        const tx = await blackbox.buyRifle({
            value: ethers.utils.parseEther("5"),
        });
        await tx.wait();
    } catch (error) {
        alert("transaction error", error)
        console.log(error);
    }

    getRewards();
  };

  const getRewards = async () => {
    if (blackbox) {
      setIllegalGoods(await blackbox.getUserArmaments());
    }
  };

  const initUser = () => {
    if (!metaWallet) {
      return <p>Please install Metamask in order to use this App.</p>;
    }

    if (!account) {
      return (
        <button onClick={loginWallet}>
          Please connect your Metamask wallet
        </button>
      );
    }

    return (
      <div>
        <p>Your Account: {`...${account.toString().slice(-4)}`}</p>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginBottom: '10px' 
        }}>
          <button onClick={switchAccount}>Switch Account</button>
          <button onClick={logoutWallet}>Disconnect Wallet</button>
        </div>

        {account ? (
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <button onClick={buyMelee}>Buy Melee</button>
            <button onClick={buyHandgun}> Buy Handgun</button>
            <button onClick={buyRifle}> Buy Rifle</button>
          </div>
        ) : (
          <p>Please Connect Account.</p>
        )}
        
        <hr />
        <h2> Your Armory </h2>
        <ul>
          {illegalGoods.map((prize, index) => (
            <li key={index}>{prize}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
    
  }, []);

  useEffect(() => {
    getRewards();
  }, [blackbox])

  return (
    <main 
      className="container" 
      style={
        {
          backgroundImage: `url(https://hips.hearstapps.com/hmg-prod/images/camouflage-pattern-background-royalty-free-image-1706201424.jpg)`,
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh'
        }
      }>
      <header>
        <h1>Welcome to Weapons Blackbox!</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
            color: #FFFFFF;
            text-align: center;
            font-family: Arial;
          }
          body {
            font-family: Arial;
          }
        `}
      </style>
    </main>
  );
}