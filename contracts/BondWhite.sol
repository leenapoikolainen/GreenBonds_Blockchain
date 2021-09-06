// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import "./GreenBond_daily.sol"; 

contract BondWhite is GreenBond_daily {
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
    ) GreenBond_daily(company, name, symbol, numberOfBondsSought, minCoupon, maxCoupon,
        bidClosingTime, term, couponsPerTerm, baseBondURI) {
    }
}