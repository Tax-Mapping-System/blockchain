const managerContract = artifacts.require("Controllar");
const truffleAssert = require("truffle-assertions");
const chai = require("chai");
const expect = chai.expect;

const [NotRegisterd, Admin, User, ProjectOwner, Gov] = [0, 1, 2, 3, 4];

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
    it("can not set Project owner role without secondary auth", async () => {
      throw new Error("Not completed");
    });

    it("can not set Admin role without gov auth", async () => {
      throw new Error("Not completed");
    });
    it("can not set new role without user info", async () => {
      throw new Error("Not completed");
    });
    it("can not set another GOV auth", async () => {
      throw new Error("Not completed");
    });
  });

  describe("getUserRole", () => {
    it("should return user role", async () => {
      const newUser = accounts[1];

      await truffleAssert.passes(addNewUser(newUser, User));

      const result = await contract.getUserRole({ from: newUser });

      expect(parseInt(result)).to.be.eql(User);
    });

    it("should return gov role", async () => {
      const result = await contract.getUserRole({ from: govAddress });

      expect(parseInt(result)).to.be.eql(Gov);
    });

    it("should return unregisterd role", async () => {
      const user = accounts[1];
      const result = await contract.getUserRole({ from: user });

      expect(parseInt(result)).to.be.eql(NotRegisterd);
    });
    it("should return Admin role", async () => {
      const newUser = accounts[1];

      await truffleAssert.passes(addNewUser(newUser, Admin));

      const result = await contract.getUserRole({ from: newUser });

      expect(parseInt(result)).to.be.eql(Admin);
    });
    it("should return Project owner role", async () => {
      const newUser = accounts[1];

      await truffleAssert.passes(addNewUser(newUser, ProjectOwner));

      const result = await contract.getUserRole({ from: newUser });

      expect(parseInt(result)).to.be.eql(ProjectOwner);
    });
  });
});
