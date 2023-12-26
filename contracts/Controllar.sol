// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IController.sol";
import "./Token.sol";
import "./utillContracts/Utility.sol";



contract Controllar is IController {

  
    address private immutable govAddress;

    mapping(address => Role) private userRoleMap; //users rols
    mapping(address => UserData) private userInformationMap; //duble encripted byte converted object string

    mapping(uint256 => address) private projectMap; // store project token address with unique id
    mapping(address => uint256) private addressToIdMap; //token address => id
    mapping(uint256 => bool) private projectIsTransactionAvailable; // contract address => bool. this check if the contract can request money. use for security
    uint256 private availableProjectId; //store next available projectId

    mapping(address => mapping(uint16 => uint256)) private userPaymentsMap; // record user payments (useraddress=>(year=>moneyTotal))

    uint256 private availableMoneyRequestId; //help to tract money requests

    mapping(uint256 => MoneyRequest) moneyRequestMap; //request id-> object


    constructor(){
        govAddress =  msg.sender;
        userRoleMap[msg.sender]= Role.Gov ;
        availableProjectId = 0;
        availableMoneyRequestId = 1;
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

    modifier onlyTransactionAvailableProjectToken() {
        require(
            
            projectIsTransactionAvailable[addressToIdMap[msg.sender]],
            "contract meney request blocked ERROR:4"
        );
        _;
    }

    modifier onlyValidProjectOwner(address projectOwner){
        require(userRoleMap[projectOwner] == Role.ProjectOwner,"invalid project owner Error:7");
        _;
    }

    modifier onlyValidRequestId(uint256 requestId){

        MoneyRequest memory moneyRequest = moneyRequestMap[requestId];

        require(
        (moneyRequest.requestId != 0)  &&
        (moneyRequest.status == ProjectMoneyEventType.SendMoneyRequest),
        "invalid request id Error:8"
        );
        _;
    }

    modifier onlyHaveMoney(uint256 requestId){
        //check if contract available money
         require( address(this).balance >= moneyRequestMap[requestId].money , "Insufficient funds in the contract Error:6");
        _;
    }

    modifier onlyApprovalAvailable(uint256 requestId){
        require(  moneyRequestMap[requestId].approvedBy == address(0) , "Approval not available Error:9");
        _;
    }

    //private
    function isSenderGovAddress() private view returns (bool) {
        return (msg.sender == govAddress);
    }

    function requireGov() private view {
        require(isSenderGovAddress(), "You havent authority to access ERROR:0");
    }

    function setUserData(bytes calldata userInfo, address userAddress) private {
        userInformationMap[userAddress].userInfo = userInfo;
    }

    function getUserData(address userAddress) private view returns(UserData memory){
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

    function createNewProject(bytes memory projectImutableData, string memory projectName, address projectOwner) external onlySecondaryAuth onlyValidProjectOwner(projectOwner){

        address newProjectAddress = address(new Token(projectImutableData,projectName, availableProjectId, projectOwner));

        projectMap[availableProjectId] = newProjectAddress;
        projectIsTransactionAvailable[availableProjectId] = true;
        addressToIdMap[newProjectAddress] = availableProjectId;
        
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

    function changeTokenMoneyRequestingState(uint256 tokenId, bool state) external onlySecondaryAuth {
        projectIsTransactionAvailable[tokenId] = state;
        emit changeTokenMoneyRequestingStateEvent( tokenId, state);
    }

    function projectMoneyRequest(MoneyRequest memory moneyRequest) external override onlyTransactionAvailableProjectToken returns(uint256) {

        moneyRequest.requestId = availableMoneyRequestId;

        moneyRequestMap[availableMoneyRequestId] = moneyRequest;

        emit projectMoneyRequestEvent(msg.sender,moneyRequest.tokenId,availableMoneyRequestId, moneyRequest.money,moneyRequest.requestReason);
        availableMoneyRequestId++;

        return moneyRequest.requestId ;
    }

    function rejectMoneyRequest(uint256 requestID, string calldata reason) external onlySecondaryAuth onlyValidRequestId(requestID){
        MoneyRequest memory moneyRequest = moneyRequestMap[requestID];

        moneyRequest.status = ProjectMoneyEventType.Rejected;
        moneyRequest.rejectedBy = msg.sender;
        moneyRequest.rejectReason = reason;

        moneyRequestMap[moneyRequest.requestId] = moneyRequest;

        emit rejectMoneyRequestEvent(requestID,msg.sender,moneyRequest.money,reason);
        
    }

    function approveMoneyRequest (uint256 requestID) external onlySecondaryAuth onlyValidRequestId(requestID) onlyHaveMoney(requestID){
        MoneyRequest memory moneyRequest = moneyRequestMap[requestID];

        moneyRequest.status = ProjectMoneyEventType.Approved;
        moneyRequest.approvedBy = msg.sender;
        moneyRequestMap[moneyRequest.requestId] = moneyRequest;

        address tokenAddress = projectMap[moneyRequest.tokenId];
        // payable(tokenAddress).transfer(moneyRequest.money);
        (bool success, ) = tokenAddress.call{value: moneyRequest.money}("");
        require(success, "Transfer to Money failed");


        emit approveMoneyRequestEvent(requestID,msg.sender, moneyRequest.money);

    }
}
