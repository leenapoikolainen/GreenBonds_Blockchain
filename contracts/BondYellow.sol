// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenBond3.sol"; // Daily Bond

contract BondYellow is GreenBond3 {
    constructor(
        address company,
        string memory name,
        string memory symbol,
        uint256 numberOfBondsSought,
        uint256 minCoupon,
        uint256 maxCoupon,
        uint256 bidClosingTime,
        uint256 term,
        uint256 couponsPerTerm,
        string memory baseBondURI
    ) GreenBond3(company, name, symbol, numberOfBondsSought, minCoupon, maxCoupon,
        bidClosingTime, term, couponsPerTerm, baseBondURI) {

    }
}