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
}
