const managerContract = artifacts.require("Controllar");
const truffleAssert = require("truffle-assertions");
const chai = require("chai");
const expect = chai.expect;

const [NotRegisterd, Admin, User, ProjectOwner, Gov] = [0, 1, 2, 3, 4];

contract("Manager Contract", (accounts) => {
  const govAddress = accounts[0];
  const testUserInfo = "{userName:TestName, NIC:TestNIC";

  const projectImutableData = "{location:colombo,start_year:2021}";
  const projectName = "Nelum kuluna";

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

  const createNewProjectToken = (
    testProjectImutableData = projectImutableData,
    testProjectName = projectName,
    from = govAddress
  ) => {
    return contract.createNewProject(
      getBytes(testProjectImutableData),
      testProjectName,
      { from: from }
    );
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

      assertEventArray(["registerNewUserAddress"], emitedEvents);
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

      assertEventArray(["registerNewUserAddress"], emitedEvents);
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

      expect(hexToBuffer(userData.userInfo).toString()).to.be.eql(
        userDataBytes.toString()
      );
    });
  });

  describe("getIndividualUserData", () => {
    it("can get user data", async () => {
      const newUser = accounts[2];
      const adminAddress = accounts[3];
      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(newUser, User, userDataBytes));
      await truffleAssert.passes(
        addNewUser(adminAddress, Admin, userDataBytes)
      );

      [govAddress, adminAddress].map((a) => {
        contract
          .getIndividualUserData(newUser, {
            from: a,
          })
          .then((userData) => {
            expect(hexToBuffer(userData.userInfo).toString()).to.be.eql(
              userDataBytes.toString()
            );
          });
      });
    });
    it("can not get user data without secondary auth", async () => {
      const newUser = accounts[2];
      const fakeUser = accounts[3];
      const user = accounts[4];
      const projectOwner = accounts[5];
      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(newUser, User, userDataBytes));

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));
      await truffleAssert.passes(
        addNewUser(projectOwner, ProjectOwner, userDataBytes)
      );

      [fakeUser, user, projectOwner].map(async (a) => {
        await truffleAssert.reverts(
          contract.getIndividualUserData(newUser, {
            from: a,
          }),
          "You havent authority to access ERROR:1"
        );
      });
    });
  });

  describe("createNewProject", () => {
    it("can create a new project with secondary auth token", async () => {
      const admin = accounts[2];
      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(admin, Admin, userDataBytes));

      [admin, govAddress].map((a) => {
        contract
          .createNewProject(getBytes(projectImutableData), projectName, {
            from: a,
          })
          .then((result) => {
            const emitedEvents = result.logs.map((e) => e.event);

            assertEventArray(["createNewProjectToken"], emitedEvents);
          });
      });
    });

    it("can create a new project only secondary auth", async () => {
      const fakeUser = accounts[2];
      const user = accounts[3];
      const projectOwner = accounts[4];

      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));
      await truffleAssert.passes(
        addNewUser(projectOwner, ProjectOwner, userDataBytes)
      );

      [fakeUser, user, projectOwner].map(async (a) => {
        await truffleAssert.reverts(
          createNewProjectToken(projectImutableData, projectName, a),
          "You havent authority to access ERROR:1"
        );
      });
    });
  });

  describe("payTax", () => {
    it("can pay tax", async () => {
      const user = accounts[1];
      const userDataBytes = getBytes(testUserInfo);
      const value = 1000000;
      const year = 2023;

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));

      const result = await contract.payTax(year, {
        from: user,
        value: value,
      });

      const emitedEvents = result.logs.map((e) => e.event);

      assertEventArray(["taxPayment"], emitedEvents);
    });

    it("can only pay tax registerd users", async () => {
      const user = accounts[1];
      const value = 1000000;
      const year = 2023;

      await truffleAssert.reverts(
        contract.payTax(year, { from: user, value: value }),
        "You havent registerd yet ERROR:3"
      );
    });
  });

  describe("getMyTaxPaymentDataInYear", () => {
    it("can get user tax payment in to year", async () => {
      const user = accounts[1];
      const userDataBytes = getBytes(testUserInfo);
      const value = 1000000;
      const year = 2023;

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));

      await contract.payTax(year, { from: user, value: value });

      const result = await contract.getMyTaxPaymentDataInYear(year, {
        from: user,
      });

      expect(parseInt(result)).to.be.eql(value);
    });
  });

  describe("getIndividualUserTaxPaymentDataInYear", () => {
    it("can get individual users tax payment in year", async () => {
      const user = accounts[1];
      const userDataBytes = getBytes(testUserInfo);
      const year = 2023;
      const value = 1000000;

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));

      await contract.payTax(year, { from: user, value: value });

      const result = await contract.getIndividualUserTaxPaymentDataInYear(
        user,
        year,
        {
          from: govAddress,
        }
      );

      expect(parseInt(result)).to.be.eql(value);
    });
    it("can get individual users tax payment in year only secondary auth", async () => {
      const user = accounts[2];
      const userDataBytes = getBytes(testUserInfo);
      const admin = accounts[3];
      const fakeUser = accounts[4];

      const year = 2023;
      const value = 1000000;

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));
      await truffleAssert.passes(addNewUser(admin, Admin, userDataBytes));

      await contract.payTax(year, { from: user, value: value });

      [admin, govAddress].map((a) => {
        contract
          .getIndividualUserTaxPaymentDataInYear(user, year, {
            from: a,
          })
          .then((result) => {
            expect(parseInt(result)).to.be.eql(value);
          });
      });
    });
    it("can not get individual data without secondary auth", async () => {
      const user = accounts[2];
      const fakeUser = accounts[3];
      const projectOwner = accounts[5];

      const userDataBytes = getBytes(testUserInfo);

      const year = 2023;
      const value = 1000000;

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));
      await truffleAssert.passes(
        addNewUser(projectOwner, ProjectOwner, userDataBytes)
      );

      await contract.payTax(year, { from: user, value: value });

      [projectOwner, user, fakeUser].map(async (a) => {
        await truffleAssert.reverts(
          contract.getIndividualUserTaxPaymentDataInYear(user, year, {
            from: fakeUser,
          }),
          "You havent authority to access ERROR:1"
        );
      });
    });
  });
  describe("getProjectById", () => {
    it("can get project contract address by id", async () => {
      await createNewProjectToken();

      const result = await contract.getProjectById(0, { from: govAddress });

      expect(result).to.be.not.null;
    });
  });

  describe("changeTokenMoneyRequestingState", () => {
    it("can change token money requesting state", async () => {
      await createNewProjectToken();

      const result = await contract.changeTokenMoneyRequestingState(0, true, {
        from: govAddress,
      });

      const emitedEvents = result.logs.map((e) => e.event);

      assertEventArray(["changeTokenMoneyRequestingStateEvent"], emitedEvents);
    });

    it("can not change token money requesting state without secondary auth", async () => {
      const user = accounts[1];
      const projectOwner = accounts[2];
      const fakeUser = accounts[3];
      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(user, User, userDataBytes));
      await truffleAssert.passes(
        addNewUser(projectOwner, ProjectOwner, userDataBytes)
      );

      await createNewProjectToken();

      [user, projectOwner, fakeUser].map(async (a) => {
        await truffleAssert.reverts(
          contract.changeTokenMoneyRequestingState(0, true, {
            from: a,
          }),
          "You havent authority to access ERROR:1"
        );
      });
    });
    it("can change token money requesting state with secondary auth", async () => {
      const admin = accounts[1];
      const userDataBytes = getBytes(testUserInfo);

      await truffleAssert.passes(addNewUser(admin, Admin, userDataBytes));

      await createNewProjectToken();

      [admin, govAddress].map(async (a) => {
        await truffleAssert.passes(
          contract.changeTokenMoneyRequestingState(0, true, {
            from: a,
          })
        );
      });
    });
  });
});
