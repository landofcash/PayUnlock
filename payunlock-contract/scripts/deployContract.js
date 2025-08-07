const { ethers } = require("hardhat");

module.exports = async () => {
  try {
    //Assign the first signer, which comes from the first privateKey from our configuration in hardhat.config.js, to a wallet variable.
    let wallet = (await ethers.getSigners())[0];
    console.log("Deploying from wallet:", wallet.address);

    //Initialize a contract factory object
    //name of contract as first parameter
    //wallet/signer used for signing the contract calls/transactions with this contract
    const PayUnlock = await ethers.getContractFactory("PayUnlock", wallet);
    console.log("Contract factory created successfully");

    //Using already initialized contract factory object with our contract, we can invoke deploy function to deploy the contract.
    //Accepts constructor parameters from our contract
    const payUnlock = await PayUnlock.deploy();
    console.log("Deploy transaction sent:", payUnlock.deployTransaction.hash);

    //We use wait to receive the transaction (deployment) receipt, which contains contractAddress
    const receipt = await payUnlock.deployTransaction.wait();
    const contractAddress = receipt.contractAddress;

    console.log(`PayUnlock deployed to: ${contractAddress}`);
    console.log("Gas used:", receipt.gasUsed.toString());

    // Verify the contract has code
    const code = await ethers.provider.getCode(contractAddress);
    if (code === "0x") {
      console.error("ERROR: Deployed contract has no bytecode!");
    } else {
      console.log("✓ Contract deployment successful, bytecode length:", code.length);
    }

    return contractAddress;
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
};
