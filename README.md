# WeaponBlackbox - AVAX Project 2 Intermediate

Solidity smart contract with Javascript as frontend using ethers.js library.

## Description
`WeaponBlackbox` is a smart contract where users will buy a weapon blackbox using `Etherium (ETH)` as currency. This contract is interacting with a JS frontend that uses ethers.js library to connect to a MetaMask wallet and buy a blackbox.

## Getting Started

### Requirements
- [Node.js](https://nodejs.org/en) is installed in your IDE
- Should have a [MetaMask](https://metamask.io/download/) browser extension

### How to Run the Program?
1. In your terminal, install all the necessary dependencies.
```bash
 npm install
```

2. Run the local Etherium Node
```bash
  npx hardhat node
```

3. In a separate terminal, compile and deploy your contract.
```bash
  npx hardhat compile
  npx hardhat run scripts/deploy.js --network localhost
```

4. Connect your MetaMask wallet to the local network

5. Launch the frontend
```bash
  npm run dev
```

6. Open the web browser and go to `http://localhost:3000`

7. Connect your MetaMask wallet and interact with the app to buy blackboxes and view the weapons.

## Help
If you encounter issues with the project, consider the following steps:

- Ensure that MetaMask is correctly connected to your local Ethereum network.
- Check that the smart contract is correctly deployed and the address in the frontend matches.
- Review the console logs for any errors in transactions or interaction with the contract.

## License
This project is licensed under the MIT License.