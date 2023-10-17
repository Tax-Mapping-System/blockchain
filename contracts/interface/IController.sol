// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum Role {
    NotRegisterd, //0
    Admin, // 1
    User, // 2
    ProjectOwner, //3
    Gov //4
}

interface IController {
    struct UserData {
        bytes userInfo;
    }

    //events
    event registerNewUserAddress(address indexed user, Role indexed role);
    event createNewProjectToken (uint256 indexed projectId, address indexed tokenAddress, string projectName);
    event taxPayment (address indexed user, uint16 indexed year, uint payment);
    event projectMoneyRequestEvent (address indexed tokenAddress, uint256 indexed tokenId, uint256 indexed requestId, uint256 money, string reason );
    event changeTokenMoneyRequestingStateEvent (uint256 indexed tokenId, bool state);


    //external
    function projectMoneyRequest(uint256 moneyRequest, uint256 tokenId, string memory reason) external ;
}
