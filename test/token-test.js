const tokenContract = artifacts.require("Token");
const truffleAssert = require("truffle-assertions");
const chai = require("chai");
const expect = chai.expect;

const [ReciverdMoney, SendMoneyRequest, MoneyWithdrawal] = [0, 1, 2];

contract("Token Contract", (accounts) => {
  const govAddress = accounts[0];

  const projectImutableData = "{location:colombo,start_year:2021}";
  const projectName = "Nelum kuluna";
  const tokenId = 0;

  let contract;

  beforeEach(async () => {
    contract = await tokenContract.new(
      getBytes(projectImutableData),
      projectName,
      tokenId,
      {
        from: govAddress,
      }
    );
  });

  const assertEventArray = (expected, given) => {
    expect(expected).to.have.all.members(given); // passes
  };

  const getBytes = (stringData) => {
    return Buffer.from(stringData, "utf8");
  };
  const hexToBuffer = (hexVal) => {
    return Buffer.from(hexVal.slice(2), "hex");
  };

  //tests

  describe("govAddress", () => {
    it("can get gov address", async () => {
      const result = await contract.govAddress();
      expect(result).to.be.eql(govAddress);
    });
  });

  describe("getImutableData", () => {
    it("should be able to read immutable data", async () => {
      const result = await contract.getImutableData();

      expect(hexToBuffer(result).toString()).to.be.eql(projectImutableData);
    });
  });

  describe("getProjectName", () => {
    it("can get project name", async () => {
      const result = await contract.getProjectName();

      expect(result).to.be.eql(projectName);
    });
  });

  // describe("getProjectOwner", () => {});

  describe("moneyRequest", () => {
    // can not handle othere test cases

    it("can not send money request without auth", async () => {
      await truffleAssert.reverts(
        contract.moneyRequest(100, "for buy light", { from: accounts[1] }),
        "You havent authority to access ERROR:1"
      );
    });
  });

  describe("withdrawMoney", () => {
    it("can not withdraw money without token aith", async () => {
      const fakeUser = accounts[1];
      const money = 1000;
      const reason = "buy bulbs for project";

      await truffleAssert.reverts(
        contract.withdrawMoney(money, reason, { from: fakeUser }),
        "You havent authority to access ERROR:1"
      );
    });
    it("can not withdraw money without correct mony", async () => {
      const money = 0;
      const reason = "buy bulbs for project";
      await truffleAssert.reverts(
        contract.withdrawMoney(money, reason, { from: govAddress }),
        "Amount must be greater than 0 Error:5"
      );
    });
    it("can not withdraw money without contract insufficient mony", async () => {
      const money = 1000;
      const reason = "buy bulbs for project";
      await truffleAssert.reverts(
        contract.withdrawMoney(money, reason, { from: govAddress }),
        "Insufficient funds in the contract Error:6"
      );
    });
  });
});
