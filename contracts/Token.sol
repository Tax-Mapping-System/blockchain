// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IToken.sol";
import "./utillContracts/Auth.sol";

import "./interface/IController.sol";

contract Token is IToken, Auth{

    bytes private immutableData;
    string private projectName;
    uint256 public immutable id;

    address private immutable controllerContractAddress = msg.sender;


    constructor(bytes memory projectImmutableData, string memory name, uint256 tokenId)Auth()
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
        IController(controllerContractAddress).projectMoneyRequest(money, id, reason);

        emit ProjectEvent(ProjectMoneyEventType.SendMoneyRequest,msg.sender,money, reason);
    }

    function withdrawMoney (uint256 money, string memory reason) external onlyProjectAuth{

        moneyWithdrow(money);

        emit ProjectEvent(ProjectMoneyEventType.MoneyWithdrawal,msg.sender,money, reason);

    }
 
}
