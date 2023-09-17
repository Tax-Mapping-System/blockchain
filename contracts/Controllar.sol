// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

enum Role {
    NotRegisterd , //0
    Admin, // 1
    User, // 2
    ProjectOwner, //3
    Gov //4
}

contract Controllar {
    address private immutable govAddress = msg.sender;

    mapping(address => Role) private userRoleMap; //users rols
    mapping(address => bytes) private userInformationMap; //duble encripted byte converted object string

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

    function setUserData(bytes calldata userInfo, address userAddress) internal {
        userInformationMap[userAddress] = userInfo;
    }

    //external
    function getUserRole() external view returns (Role) {
        if(requireGovAddress()){
           return Role.Gov;
        }
        else{
             return userRoleMap[msg.sender];
        }
    }

    function setUserRole(
        address newUserAddress,
        Role role,
        bytes calldata userInfo
    ) external onlySecondaryAuth {

        userRoleMap[newUserAddress] = role;
        setUserData(userInfo,newUserAddress);

        emit addNewUserAddress(newUserAddress, role);
    }
}
