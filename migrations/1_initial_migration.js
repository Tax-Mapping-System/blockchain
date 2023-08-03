const Migrations = artifacts.require("Controllar");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
