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

    
    //public 
    function getProjectName() public view returns(string memory){
            return projectName;
    }

    //external 
    function getImutableData() external view returns(bytes memory){
        return immutableData;
    }

    function moneyRequest(uint256 money) external onlyProjectAuth {
        IController(controllerContractAddress).projectMoneyRequest(money, id);

        emit ProjectEvent(ProjectMoneyEventType.SendMoneyRequest,money);
    }
 
}
