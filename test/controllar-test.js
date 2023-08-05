const managerContract = artifacts.require("Controllar");
const truffleAssert = require("truffle-assertions");
const chai = require("chai");
const expect = chai.expect;

const [Default, Admin, User] = [0, 1, 2];

contract("Manager Contract", (accounts) => {
  const govAddress = accounts[0];

  let contract;

  beforeEach(async () => {
    contract = await managerContract.new({
      from: govAddress,
    });
  });

  const assertEventArray = (expected, given) => {
    expect(expected).to.have.all.members(given); // passes
  };

  const addNewUser = (newUser, role, from = govAddress) => {
    return contract.setUserRole(newUser, role, {
      from: from,
    });
  };

  //test

  describe("setUserRole", () => {
    it("should set user with gov role", async () => {
      const newUser = accounts[1];

      const result = await addNewUser(newUser, Admin);

      const emitedEvents = result.logs.map((e) => e.event);

      assertEventArray(["addNewUserAddress"], emitedEvents);
    });
    it("should set user with Admin role", async () => {
      const adminAddress = accounts[1];
      const newUser = accounts[2];

      //maeke adminAddress addmin
      await truffleAssert.passes(addNewUser(adminAddress, Admin));

      result = await addNewUser(newUser, User, adminAddress);

      const emitedEvents = result.logs.map((e) => e.event);

      assertEventArray(["addNewUserAddress"], emitedEvents);
    });
    it("can not set user role without secondary auth", async () => {
      const fakeUser = accounts[1];
      const newUser = accounts[2];

      await truffleAssert.reverts(
        addNewUser(newUser, User, fakeUser),
        "You havent authority to access ERROR:1"
      );
    });
  });

  describe("getUserRole", () => {
    it("should return user role", async () => {
      const newUser = accounts[1];

      await truffleAssert.passes(addNewUser(newUser, Admin));

      const result = await contract.getUserRole({ from: newUser });

      expect(parseInt(result)).to.be.eql(Admin);
    });
  });
});
