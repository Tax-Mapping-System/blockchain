// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IController.sol";
import "./Token.sol";



contract Controllar is IController {

  
    address private immutable govAddress;

    mapping(address => Role) private userRoleMap; //users rols
    mapping(address => UserData) private userInformationMap; //duble encripted byte converted object string

    mapping(uint256 => address) private projectMap; // store project token address with unique id
    uint256 private availableProjectId; //store next available projectId

    mapping(address => mapping(uint16 => uint256)) private userPaymentsMap; // record user payments (useraddress=>(year=>moneyTotal))


    constructor(){
        govAddress =  msg.sender;
        userRoleMap[msg.sender]= Role.Gov ;
        availableProjectId = 0;
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
    modifier onlyRegisterdUser() {
        require(
            userRoleMap[msg.sender] != Role.NotRegisterd,
            "You havent registerd yet ERROR:3"
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

    function createNewProject(bytes memory projectImutableData, string memory projectName) external onlySecondaryAuth {

        address newProjectAddress = address(new Token(projectImutableData,projectName));

        projectMap[availableProjectId] = newProjectAddress;
        
        emit createNewProjectToken(availableProjectId,newProjectAddress, projectName);
        
        availableProjectId++;
    }

    function payTax(uint16 year) external payable onlyRegisterdUser{
        
        userPaymentsMap[msg.sender][year] += msg.value;
        
        emit taxPayment(msg.sender, year, msg.value);
    } 

    function getMyTaxPaymentDataInYear(uint16 year) external view returns(uint){
        return userPaymentsMap[msg.sender][year];
    }

    function getIndividualUserTaxPaymentDataInYear( address user, uint16 year) external view onlySecondaryAuth returns(uint){
        return userPaymentsMap[user][year];
    }

    function getProjectById(uint256 id) external view returns(address){
        return projectMap[id];
    }
}
