const hre = require("hardhat");

async function main() {
  const Assessment = await hre.ethers.getContractFactory("Blackbox");
  const assessment = await Assessment.deploy();
  await assessment.deployed();

  console.log(`Lootbox contract has been deployed to ${assessment.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });