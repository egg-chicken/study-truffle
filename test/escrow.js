const Escrow = artifacts.require("./Escrow.sol");
const OreCoin = artifacts.require("./OreCoin.sol");

contract('Escrow', (accounts) => {
  const oneEther = web3.toWei(1, 'ether');
  let orecoin, escrow;

  beforeEach(async () => {
    orecoin = await OreCoin.new(10000, 'orecoin', 'oc');
    escrow = await Escrow.new(orecoin.address, 7000, oneEther);
  });

  describe('sendTransaction', () => {
    it('should set buyer and agreement', async () => {
      await orecoin.sendCoin(escrow.address, 7000);
      await escrow.sendTransaction({ from: accounts[1], value: oneEther });
      const buyer = await escrow.buyer.call();
      const seller = await escrow.seller.call();
      const agreement = await escrow.agreement.call();
      expect(buyer).to.equal(accounts[1]);
      expect(seller).to.equal(accounts[0]);
      expect(agreement).to.equal(true);
    });
  });

  describe('solve', () => {
    it('should trade coin and ether', async () => {
      await orecoin.sendCoin(escrow.address, 7000);
      await escrow.sendTransaction({ from: accounts[1], value: oneEther });
      const beforeEither = Math.ceil(web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether'));
      await escrow.solve();
      const afterEither = Math.ceil(web3.fromWei(web3.eth.getBalance(accounts[0]), 'ether'));
      const boughtCoin = await orecoin.balances(accounts[1]);
      expect(boughtCoin.toNumber()).to.equal(7000);
      expect(beforeEither + 1).to.equal(afterEither);
    });
  });
});
