const tokenContract = artifacts.require("Token");
const truffleAssert = require("truffle-assertions");
const chai = require("chai");
const expect = chai.expect;

contract("Token Contract", (accounts) => {
  const govAddress = accounts[0];

  const projectImutableData = "{location:colombo,start_year:2021}";

  let contract;

  beforeEach(async () => {
    contract = await tokenContract.new(getBytes(projectImutableData), {
      from: govAddress,
    });
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

  // describe("getProjectOwner", () => {});
});
