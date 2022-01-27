// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGame {
    function isUserGov(address _user) external view returns(bool);
    function withdrowGov()external returns(uint256);
}
