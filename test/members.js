const Members = artifacts.require("./Members.sol");

contract('Members', (accounts) => {
  let members;

  beforeEach(async () => {
    const dummyAddress = accounts[0];
    members = await Members.new(dummyAddress);
  });

  describe('pushRank', () => {
    it('should push bronze rank', async () => {
      await members.pushRank('Bronze', 1, 5, 10);
      const rank = await members.ranks.call(1);
      expect(rank[0]).to.equal('Bronze');
      expect(rank[1].toNumber()).to.equal(1);
      expect(rank[2].toNumber()).to.equal(5);
      expect(rank[3].toNumber()).to.equal(10);
    });
  });

  describe('addTransactionAmount', () => {
    it('should update transactionCount, transactionAmoount and rankIndex', async () => {
      await members.pushRank('Bronze', 1, 5, 10);
      await members.addTransactionAmount(accounts[0], 2);
      await members.addTransactionAmount(accounts[0], 3);
      const member = await members.members.call(accounts[0]);
      expect(member[0].toNumber()).to.equal(2);
      expect(member[1].toNumber()).to.equal(5);
      expect(member[2].toNumber()).to.equal(1);
    });
  });

  describe('getDiscountRate', () => {
    it('should return 0 when they are default user', async () => {
      const rate = await members.getDiscountRate.call(accounts[0]);
      expect(rate.toNumber()).to.equal(0);
    });

    it('should return 10 when they are special user', async () => {
      await members.pushRank('Bronze', 1, 5, 10);
      await members.addTransactionAmount(accounts[0], 1000);
      const rate = await members.getDiscountRate.call(accounts[0]);
      expect(rate.toNumber()).to.equal(10);
    });
  });
});
