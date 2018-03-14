const Crowdsale = artifacts.require("./Crowdsale.sol");
const OreCoin = artifacts.require("./OreCoin.sol");

const sleep = (waitSeconds) => {
  return new Promise((resolve) => {
    global.setTimeout(() => resolve(), waitSeconds * 1000);
  });
};

contract('Crowdsale', (accounts) => {
  let crowdsale;
  let orecoin;

  const initializeContract = async (saleLength) => {
    // Devide 1000 because javascript time is msec, solidity time is sec.
    const start = Date.now() / 1000;
    const end = start + saleLength;

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

  describe('withdraw', () => {
    it('should fail between crowdsale open', async () => {
      await initializeContract(1000);
      return crowdsale.withdraw().catch(assert.ok);
    });

    it('should reward orecoin if crowdsale got the goal', async () => {
      await initializeContract(1);
      await crowdsale.sendTransaction({from: accounts[1], value: 10000 });
      await sleep(1);
      await crowdsale.withdraw({from: accounts[1]});
      const coin = await orecoin.balances.call(accounts[1]);
      expect(coin.toNumber()).to.equal(5000);
    });

    it('should return ether if crowdsale did not get the goal', async () => {
      await initializeContract(1);
      await crowdsale.sendTransaction({from: accounts[2], value: 1000 });
      await sleep(1);
      const beforeBalance = web3.eth.getBalance(crowdsale.address);
      await crowdsale.withdraw({from: accounts[2]});
      const coin = await orecoin.balances.call(accounts[2]);
      const afterBalance = web3.eth.getBalance(crowdsale.address);

      expect(coin.toNumber()).to.equal(0);
      expect(beforeBalance.toNumber()).to.equal(1000);
      expect(afterBalance.toNumber()).to.equal(0);
    });
  });
});
