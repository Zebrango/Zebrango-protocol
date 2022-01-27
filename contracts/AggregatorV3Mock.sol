// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


contract AggregatorV3Mock {
     //Mocks the  pricefeeds aggregator, and get Random numbers but do satisfy the checks.
         //  (uint80 roundId, int256 price , , uint256 timestamp, ) = oracle.latestRoundData();

    function latestRoundData () external view returns (uint80, uint256, uint8 , uint256 ,uint8 ){
        return (uint80(block.timestamp), (uint256(keccak256(abi.encodePacked(block.timestamp))) % 100) + 1 ,0, block.timestamp,0 ) ;
    }


}
