var OreCoin = artifacts.require("./OreCoin.sol");

module.exports = function(deployer) {
  deployer.deploy(OreCoin, 10000, 'orecoin', 'oc');
};
