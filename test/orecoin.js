const OreCoin = artifacts.require("./OreCoin.sol");

contract('OreCoin', (accounts) => {
  it('should put 10000 oc in the first account', async () => {
    const orecoin = await OreCoin.deployed();
    const balance = await orecoin.getBalance.call(accounts[0]);
    expect(balance.toNumber()).to.equal(10000);
  });

  describe('sendCoin', () => {
    it('should send 10 oc', async () => {
      const orecoin = await OreCoin.deployed();
      await orecoin.sendCoin(accounts[1], 10, { from: accounts[0] });
      const sender = await orecoin.getBalance.call(accounts[0]);
      const receiver = await orecoin.getBalance.call(accounts[1]);
      expect(sender.toNumber()).to.equal(9990);
      expect(receiver.toNumber()).to.equal(10);
    });

    it('should send event', async () => {
      const orecoin = await OreCoin.deployed();
      const result = await orecoin.sendCoin(accounts[1], 10, { from: accounts[0] });
      const events = result.logs.map((log) => log.event);
      expect(events).to.include('SendCoin');
    });
  });
});
