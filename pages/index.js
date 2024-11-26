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

  const getSolContract = async () => {
    const provider = new ethers.providers.Web3Provider(metaWallet);
    const signer = provider.getSigner();
    const lootContract = new ethers.Contract(contractAddress, blackboxABI, signer);

    setBlackboxGoods(lootContract);
  };

  const connectAccount = async () => {
    if (!metaWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await metaWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    await getSolContract();
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

  const getRewards = async () => {
    if (blackbox) {
      setIllegalGoods(await blackbox.getMyPrizes());
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!metaWallet) {
      return <p>Please install Metamask in order to use this App.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return (
        <button onClick={connectAccount}>
          Please connect your Metamask wallet
        </button>
      );
    }

    return (
      <div>
        <p>Your Account: {`...${account.toString().slice(-4)}`}</p>
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
    <main className="container">
      <header>
        <h1>Welcome to Weapons Blackbox!</h1>
      </header>
      {initUser()}
      <style jsx>
        {`
          .container {
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