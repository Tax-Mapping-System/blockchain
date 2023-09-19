// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IController.sol";



contract Controllar is IController {

  
    address private immutable govAddress;

    mapping(address => Role) private userRoleMap; //users rols
    mapping(address => UserData) private userInformationMap; //duble encripted byte converted object string


    constructor(){
        govAddress =  msg.sender;
        userRoleMap[msg.sender]= Role.Gov ;
    }

    //modifires
    modifier onlyGov() {
        requireGov();
        _;
    }

    modifier onlySecondaryAuth() {
        require(
            isSenderGovAddress() || userRoleMap[msg.sender] == Role.Admin,
            "You havent authority to access ERROR:1"
        );

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
        userInformationMap[userAddress].userInfo = userInfo;
    }

    function getUserData(address userAddress) internal view returns(UserData memory){
        return userInformationMap[userAddress];
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

        emit registerNewUserAddress(newUserAddress, role);
    }

    function getMyUserData() external view returns(UserData memory){
        return getUserData(msg.sender);
    }

    function getIndividualUserData(address userAddress) external view onlySecondaryAuth returns (UserData memory){
        return getUserData(userAddress);
    }
}
