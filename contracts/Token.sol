// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./interface/IToken.sol";
import "./utillContracts/Auth.sol";

contract Token is IToken, Auth{

    bytes private immutableData;


    constructor(bytes memory projectImmutableData)Auth()
    {
        immutableData = projectImmutableData;
    }



    //external 
    function getImutableData() external view returns(bytes memory){
        return immutableData;
    }
 
}
