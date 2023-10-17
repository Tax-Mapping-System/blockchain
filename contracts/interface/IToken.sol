// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

enum ProjectMoneyEventType {
    ReciverdMoney,
    SendMoneyRequest,
    MoneyWithdrawal
}

interface IToken {

    //events
    event ProjectEvent(ProjectMoneyEventType indexed eventType,address callPerson, uint256 money, string reason);
}