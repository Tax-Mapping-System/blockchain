// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

enum Role {
    Default, //0
    Admin, // 1
    User // 2
}

contract Controllar {
    address private immutable govAddress = msg.sender;

    mapping(address => Role) private userRoleMap;

    //events
    event addNewUserAddress(address indexed user, Role indexed role);

    //modifires

    modifier onlySecondaryAuth() {
        require(
            requireGovAddress() || userRoleMap[msg.sender] == Role.Admin,
            "You havent authority to access ERROR:1"
        );

        _;
    }

    modifier onlyGov() {
        require(requireGovAddress(), "You havent authority to access ERROR:0");
        _;
    }

    //internal
    function requireGovAddress() internal view returns (bool) {
        return (msg.sender == govAddress);
    }

    //external
    function getUserRole() external view returns (Role) {
        return (userRoleMap[msg.sender]);
    }

    function setUserRole(
        address newUserAddress,
        Role role
    ) external onlySecondaryAuth {

        userRoleMap[newUserAddress] = role;

        emit addNewUserAddress(newUserAddress, role);
    }
}
