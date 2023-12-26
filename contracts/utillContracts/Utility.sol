// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


enum ProjectMoneyEventType {
    ReciverdMoney,
    SendMoneyRequest,
    MoneyWithdrawal,
    Rejected,
    Approved
}

struct MoneyRequest{
    uint256 requestId;
    uint256 money;
    string requestReason;
    address requestBy;
    ProjectMoneyEventType status;
    string rejectReason;
    address rejectedBy;
    uint256 tokenId;
       
    address approvedBy;

}