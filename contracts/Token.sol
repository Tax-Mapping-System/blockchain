// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IToken.sol";
import "./utillContracts/Auth.sol";

contract Token is IToken, Auth{

    bytes private immutableData;
    string private projectName;
    uint256 public immutable id;


    constructor(bytes memory projectImmutableData, string memory name, uint256 tokenId)Auth()
    {
        immutableData = projectImmutableData;
        projectName = name;
        id = tokenId;
    }



    //external 
    function getImutableData() external view returns(bytes memory){
        return immutableData;
    }

    function getProjectName() public view returns(string memory){
        return projectName;
    }
 
}
