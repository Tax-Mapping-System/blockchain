// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum ProjectEventType {
    ReciverdMoney,
    SendMoneyRequest,
    MoneyWithdrawal
}

interface IToken {

    //events
    event ProjectEvent(ProjectEventType indexed eventType);
}