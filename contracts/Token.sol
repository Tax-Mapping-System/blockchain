// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IToken.sol";
import "./utillContracts/Auth.sol";

import "./interface/IController.sol";

import "./utillContracts/Utility.sol";

contract Token is IToken, Auth{

    bytes private immutableData;
    string private projectName;
    uint256 public immutable id;

    address private immutable controllerContractAddress = msg.sender;

    constructor(bytes memory projectImmutableData, string memory name, uint256 tokenId, address projectOwner)Auth(projectOwner)
    {
        immutableData = projectImmutableData;
        projectName = name;
        id = tokenId;
    }

    //private
    function moneyWithdrow(uint256 amount) private {
        require(amount > 0, "Amount must be greater than 0 Error:5");
        require(address(this).balance >= amount, "Insufficient funds in the contract Error:6");

         payable(msg.sender).transfer(amount);

    }

    
    //public 
    function getProjectName() public view returns(string memory){
            return projectName;
    }

    //external 
    function getImutableData() external view returns(bytes memory){
        return immutableData;
    }

    function moneyRequest(uint256 money, string memory reason) external onlyProjectAuth {
        MoneyRequest memory moneyRequestObject = MoneyRequest({
            requestId: 0,
            money: money,
            requestReason: reason,
            requestBy: msg.sender,
            status: ProjectMoneyEventType.SendMoneyRequest,
            rejectReason: "",
            rejectedBy: address(0),
            tokenId: id,
            approvedBy:address(0)
        });

        uint256 requetsId = IController(controllerContractAddress).projectMoneyRequest(moneyRequestObject);

        emit MoneyReqeustEvent(requetsId, money, reason);
        emit ProjectEvent(ProjectMoneyEventType.SendMoneyRequest, moneyRequestObject.requestBy, moneyRequestObject.money, moneyRequestObject.requestReason);
    }

    function withdrawMoney (uint256 money, string memory reason) external onlyProjectAuth{

        moneyWithdrow(money);
        emit ProjectEvent(ProjectMoneyEventType.MoneyWithdrawal,msg.sender,money, reason);

    }

    receive() external payable {}
 
}
