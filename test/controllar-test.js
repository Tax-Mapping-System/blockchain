const managerContract = artifacts.require("Controllar");
const truffleAssert = require("truffle-assertions");
const chai = require("chai");
const expect = chai.expect;

const [NotRegisterd, Admin, User, ProjectOwner, Gov] = [0, 1, 2, 3, 4];

contract("Manager Contract", (accounts) => {
  const govAddress = accounts[0];
  const testUserInfo = "{userName:TestName, NIC:TestNIC";

  let contract;

  beforeEach(async () => {
    contract = await managerContract.new({
      from: govAddress,
    });
  });

  const assertEventArray = (expected, given) => {
    expect(expected).to.have.all.members(given); // passes
  };

  const addNewUser = (newUser, role, userInfo, from = govAddress) => {
    return contract.setUserRole(newUser, role, userInfo, {
      from: from,
    });
  };

  const getBytes = (stringData) => {
    return Buffer.from(stringData, "utf8");
  };
  const hexToBuffer = (hexVal) => {
    return Buffer.from(hexVal.slice(2), "hex");
  };

  //test

  describe("setUserRole", () => {
    // all the testing done without the ecriptions
    it("should set user with gov role", async () => {
      const newUser = accounts[1];

      const result = await addNewUser(newUser, Admin, getBytes(testUserInfo));

      const emitedEvents = result.logs.map((e) => e.event);

      assertEventArray(["addNewUserAddress"], emitedEvents);
    });

    it("should set user with Admin role", async () => {
      const adminAddress = accounts[1];
      const newUser = accounts[2];

      //maeke adminAddress addmin
      await truffleAssert.passes(
        addNewUser(adminAddress, Admin, getBytes(testUserInfo))
      );

      result = await addNewUser(
        newUser,
        User,
        getBytes(testUserInfo),
        adminAddress
      );

      const emitedEvents = result.logs.map((e) => e.event);

      assertEventArray(["addNewUserAddress"], emitedEvents);
    });

    it("can not set user role without secondary auth", async () => {
      const fakeUser = accounts[1];
      const newUser = accounts[2];

      await truffleAssert.reverts(
        addNewUser(newUser, User, getBytes(testUserInfo), fakeUser),
        "You havent authority to access ERROR:1"
      );
    });
    it("can not set Project owner role without secondary auth", async () => {
      const fakeUser = accounts[1];
      const newUser = accounts[2];

      await truffleAssert.reverts(
        addNewUser(newUser, ProjectOwner, getBytes(testUserInfo), fakeUser),
        "You havent authority to access ERROR:1"
      );
    });

    it("can not set Gov role ", async () => {
      const newUser = accounts[2];

      await truffleAssert.reverts(
        addNewUser(newUser, Gov, getBytes(testUserInfo)),
        "You havent authority to add this role: Error:2"
      );
    });

    it("can not set Admin role without gov auth", async () => {
      const newUser = accounts[1];
      const adminUser = accounts[2];

      await truffleAssert.passes(
        addNewUser(adminUser, Admin, getBytes(testUserInfo))
      );

      await truffleAssert.reverts(
        addNewUser(newUser, Admin, getBytes(testUserInfo), adminUser),
        "You havent authority to access ERROR:0"
      );
    });
    it("can not set new role without user info", async () => {
      const adminUser = accounts[2];
      await truffleAssert.fails(addNewUser(adminUser, Admin));
    });
  });

  describe("getUserRole", () => {
    it("should return user role", async () => {
      const newUser = accounts[1];

      await truffleAssert.passes(
        addNewUser(newUser, User, getBytes(testUserInfo))
      );

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

      await truffleAssert.passes(
        addNewUser(newUser, Admin, getBytes(testUserInfo))
      );

      const result = await contract.getUserRole({ from: newUser });

      expect(parseInt(result)).to.be.eql(Admin);
    });
    it("should return Project owner role", async () => {
      const newUser = accounts[1];

      await truffleAssert.passes(
        addNewUser(newUser, ProjectOwner, getBytes(testUserInfo))
      );

      const result = await contract.getUserRole({ from: newUser });

      expect(parseInt(result)).to.be.eql(ProjectOwner);
    });
  });

  describe("getMyUserData", () => {
    it("can get user data", async () => {
      const newUser = accounts[2];
      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(newUser, User, userDataBytes));

      const userData = await contract.getMyUserData({
        from: newUser,
      });

      expect(hexToBuffer(userData).toString()).to.be.eql(
        userDataBytes.toString()
      );
    });
  });
});
