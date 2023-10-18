// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Auth {

    address immutable public govAddress;
    address internal ProjectOwner;


    constructor(address projectOwnerAddress){
        ProjectOwner = projectOwnerAddress;
        govAddress = msg.sender;
    }

    //modifire

    modifier onlyGov() {
        require(isGov(), "You havent authority to access ERROR:1");
        _;
    }
    modifier onlyProgectOwner() {
        require(
            isProjectOwner(),
            "You havent authority to access ERROR:1"
        );
        _;
    }

    modifier onlyProjectAuth() {
        require(
            isGov() || isProjectOwner(),
            "You havent authority to access ERROR:1"
        );
        _;
    }

    function isGov() internal view returns(bool){
        return msg.sender == govAddress;
    }

    function isProjectOwner() internal view returns(bool){
        return msg.sender == ProjectOwner;
    }


    function getProjectOwner() external view returns(address){
        return ProjectOwner;
    }

}