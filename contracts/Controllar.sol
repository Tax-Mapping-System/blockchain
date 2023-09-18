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
    address private immutable govAddress;

    mapping(address => Role) private userRoleMap; //users rols
    mapping(address => bytes) private userInformationMap; //duble encripted byte converted object string


    constructor(){
        govAddress =  msg.sender;
        userRoleMap[msg.sender]= Role.Gov ;
    }

    //events
    event addNewUserAddress(address indexed user, Role indexed role);

    //modifires

    modifier onlySecondaryAuth() {
        require(
            isSenderGovAddress() || userRoleMap[msg.sender] == Role.Admin,
            "You havent authority to access ERROR:1"
        );

        _;
    }

    modifier onlyGov() {
        requireGov();
        _;
    }

    //internal

    function isSenderGovAddress() internal view returns (bool) {
        return (msg.sender == govAddress);
    }

    function requireGov() internal view {
        require(isSenderGovAddress(), "You havent authority to access ERROR:0");
    }

    function setUserData(bytes calldata userInfo, address userAddress) internal {
        userInformationMap[userAddress] = userInfo;
    }

    //external
    function getUserRole() external view returns (Role) {
       
        return userRoleMap[msg.sender];
        
    }

    function setUserRole(
        address newUserAddress,
        Role role,
        bytes calldata userInfo
    ) external onlySecondaryAuth {

        if(role == Role.Admin){
            requireGov();
        }
        require(role != Role.Gov,"You havent authority to add this role: Error:2");

        userRoleMap[newUserAddress] = role;
        setUserData(userInfo,newUserAddress);

        emit addNewUserAddress(newUserAddress, role);
    }

    function getMyUserData() external view returns(bytes memory){
        return userInformationMap[msg.sender];
    }
}
