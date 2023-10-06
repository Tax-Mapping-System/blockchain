// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
contract Auth {

    address immutable public govAddress;
    address internal ProjectOwner;


    constructor(){
        govAddress = msg.sender;
    }

}