const Crowdsale = artifacts.require("./Crowdsale.sol");
const OreCoin = artifacts.require("./OreCoin.sol");

contract('Crowdsale', (accounts) => {
  let crowdsale;
  let orecoin;

  const initializeContract = async (saleLength) => {
    // Devide 1000 because javascript time is msec, solidity time is sec.
    const start = Date.now() / 1000;
    const end = Date.now() / 1000 + saleLength;

    orecoin = await OreCoin.new(10000, 'orecoin', 'oc');
    crowdsale = await Crowdsale.new(10000, start, end, 4, orecoin.address);
    await orecoin.sendCoin(crowdsale.address, 5000);
  };

  describe('sendTransaction', () => {
    it('should fund to orecoin', async () => {
      await initializeContract(100);
      await crowdsale.sendTransaction({from: accounts[0], value: 100 });
      const funder = await crowdsale.funders.call(accounts[0]);
      const fundingTotal = await crowdsale.fundingTotal.call();
      const rewardTotal = await crowdsale.rewardTotal.call();
      expect(funder[0].toNumber()).to.equal(100);
      expect(funder[1].toNumber()).to.equal(50);
      expect(funder[2]).to.equal(false);
      expect(fundingTotal.toNumber()).to.equal(100);
      expect(rewardTotal.toNumber()).to.equal(50);
    });

    it('should fail if crowdsale finished', async () => {
      await initializeContract(0);
      return crowdsale.sendTransaction({from: accounts[0], value: 100 })
        .catch(assert.ok);
    });
  });
});
