const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const Contract = await hre.ethers.getContractFactory("Contract");
  
  // Deploy the contract
  const contract = await Contract.deploy();
  
  // Wait for deployment to finish
  await contract.waitForDeployment();  // Changed from deployed() to waitForDeployment()

  // Get contract address - updated syntax
  const address = await contract.getAddress();  // New way to get address
  
  console.log("Contract deployed to:", address);

  // Optional: Verify on explorer (for testnets)
  // await hre.run("verify:verify", {
  //   address: address,
  //   constructorArguments: [],
  // });
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });