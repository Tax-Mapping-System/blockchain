// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utillContracts/Utility.sol";
interface IToken {

    //events
    event ProjectEvent( ProjectMoneyEventType indexed eventType,address callPerson, uint256 money, string reason);
    event MoneyReqeustEvent(uint256 requestId, uint256 money, string reason);
}