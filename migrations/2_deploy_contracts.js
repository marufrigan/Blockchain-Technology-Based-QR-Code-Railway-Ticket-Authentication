const fs = require('fs');
const path = require('path');

const Ticketing = artifacts.require("Ticketing");

module.exports = async function (deployer) {
  await deployer.deploy(Ticketing);
  const ticketingInstance = await Ticketing.deployed();

  // Save the contract address to a JSON file
  const contractAddress = {
    address: ticketingInstance.address
  };

  const data = JSON.stringify(contractAddress, null, 2);
  const filePath = path.join(__dirname, '..', 'frontend', 'contractAddress.json');

  fs.writeFileSync(filePath, data, (err) => {
    if (err) {
      console.error('Error writing contract address to file', err);
    }
  });

  console.log('Contract address saved to frontend/contractAddress.json');
};
