const Members = artifacts.require("./Members.sol");
const OreCoin = artifacts.require("./OreCoin.sol");

contract('OreCoin', (accounts) => {
  let orecoin;

  beforeEach(async () => {
    orecoin = await OreCoin.new(10000, 'orecoin', 'oc');
  });

  it('should put 10000 oc in the first account', async () => {
    const balance = await orecoin.balances.call(accounts[0]);
    expect(balance.toNumber()).to.equal(10000);
  });

  describe('sendCoin', () => {
    it('should send 10 oc', async () => {
      await orecoin.sendCoin(accounts[1], 10, { from: accounts[0] });
      const sender = await orecoin.balances.call(accounts[0]);
      const receiver = await orecoin.balances.call(accounts[1]);
      expect(sender.toNumber()).to.equal(9990);
      expect(receiver.toNumber()).to.equal(10);
    });

    it('should send event', async () => {
      const result = await orecoin.sendCoin(accounts[1], 10, { from: accounts[0] });
      const log = result.logs[0];

      expect(log.event).to.equal('SendCoin');
      expect(log.args.from).to.equal(accounts[0]);
      expect(log.args.to).to.equal(accounts[1]);
      expect(log.args.value.toNumber()).to.equal(10);
    });

    it('should not accept negative value', () => {
      return orecoin.sendCoin(accounts[1], -10, { from: accounts[0] })
        .then(assert.fail)
        .catch(assert.ok);
    });
  });

  describe('blockAddress', () => {
    it('should block receiver sending coin', async () => {
      await orecoin.blockAddress(accounts[1], { from: accounts[0] });
      return orecoin.sendCoin(accounts[1], 10, { from: accounts[0] })
        .then(assert.fail)
        .catch(assert.ok);
    });
  });

  describe('unblockAddress', () => {
    it('should remove it from blocked_addresses', async () => {
      await orecoin.blockAddress(accounts[1], { from: accounts[0] });
      await orecoin.unblockAddress(accounts[1], { from: accounts[0] });
      await orecoin.sendCoin(accounts[1], 10, { from: accounts[0] });
      const balance = await orecoin.balances.call(accounts[1]);
      expect(balance.toNumber()).to.equal(10);
    });
  });

  describe('discount', () => {
    it('should discount when sender set discount rate', async () => {
      const shop = accounts[1];
      const client = accounts[0];

      const members = await Members.new(orecoin.address);
      await members.pushRank('Bronze', 1, 5, 10);
      await orecoin.setMembers(members.address, { from: shop });
      await orecoin.sendCoin(shop, 100, { from: client });
      await orecoin.sendCoin(shop, 100, { from: client });

      const shopBalance = await orecoin.balances.call(shop);
      expect(shopBalance.toNumber()).to.equal(190);
    });
  });
});
