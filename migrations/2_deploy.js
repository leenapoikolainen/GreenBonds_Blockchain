/*
const GreenBond2 = artifacts.require("GreenBond2");
const GreenBond3 = artifacts.require("GreenBond3");
const BondRopsten = artifacts.require("BondRopsten");
const GreenCertifier = artifacts.require("GreenCertifier");
const GreenCertificate = artifacts.require("GreenCertificate");

// Variables for greenbond3 - BLUE
let company2 = "0x94ef9712F0C40CF8a1786944DcE2399df547853b"; // Ganache account 10
let name2 = "Daily Coupons"
let symbol2 = "BLUE";
let numberOfBondsSeeked2 = 5;
let minCoupon2 = 2;
let maxCoupon2 = 8;
let closingDate2 = 1629556200
let term2 = 3; // 3 days
let couponsPerYear2 = 1; // daily
let baseURI2 = "https://test/";

// Variables for greenbond PURPLE
let company3 = "0x4f6E10546E192Ad15e0028bEa91E8c0EA4ba2C60"; // Ganache account 9
let name3 = "Building A";
let symbol3 = "PURPLE";
let numberOfBondsSeeked3 = 10;
let minCoupon3 = 5;
let maxCoupon3 = 15;
let closingDate3 = 	1629203700;
let term3 = 10; // 10 days
let couponsPerTerm3 = 1; //daily coupons
let baseURI3 = "https://ipfs.io/ipfs/QmcY4G8JiUH5CJDtqXtjusKVZvRBHNxXWURHuYgdhxu85X"; 

// Variables for Bond on Ropsten

let company4 = "0xe5dc3eFEcDc0f2Ee5672Fa287CE80733F81FCB78"; // Ropsten 2
let name4 = "North Star";
let symbol4 = "YELLOW";
let numberOfBondsSeeked4 = 10;
let minCoupon4 = 5;
let maxCoupon4 = 15;
let closingDate4 = 1629111600; // 16 Aug 2021, 12:00
let term4 = 10; // 10 days
let couponsPerTerm4 = 1; //daily coupons
let baseURI4 = "https://ipfs.io/ipfs/QmcY4G8JiUH5CJDtqXtjusKVZvRBHNxXWURHuYgdhxu85X"; 

*/

// DAILY BONDS
const BondPurple = artifacts.require("BondPurple");
const BondBlue = artifacts.require("BondBlue");

// YEARLY BONDS
const BondRed = artifacts.require("BondRed");
const BondYellow = artifacts.require("BondYellow");

// Certification & Verification Repos
const GreenVerificationRepo = artifacts.require("GreenVerificationRepository")
const GreenCertificationRepo = artifacts.require("GreenCertificateRepository")

// Company accounts
let companyGanache = "0x94ef9712F0C40CF8a1786944DcE2399df547853b"; // Ganache account #10
let companyRopsten = "0xe5dc3eFEcDc0f2Ee5672Fa287CE80733F81FCB78";

// DAILY BONDS
// 1. BLUE
let nameBlue = "Project North Star";
let symbolBlue = "BLUE";
let numberOfBondsBlue = 20;
let minCouponBlue = 1;
let maxCouponBlue = 5;
let closingDateBlue = 1630321200; // Monday August 30, 12:00
let termBlue = 2; // 2 days
let couponsPerTermBlue = 1 // daily
let baseURIBlue = "https://ipfs.io/ipfs/QmckYBJVzPM2ndTAnk4rrpVaQr5bq2ZPBRUture3xx6bLm";

// 2. PURPLE
let namePurple = "Project Snow";
let symbolPurple = "PURPLE";
let numberOfBondsPurple = 10;
let minCouponPurple = 1;
let maxCouponPurple = 10;
let closingDatePurple = 1630407600; // Tuesday August 31, 12:00
let termPurple = 10; // 10 days
let couponsPerTermPurple = 1 // daily
let baseURIPurple = "https://ipfs.io/ipfs/QmVwes2xbTK98ms4Es737nqz3YRtuwy5CUpdauFGJVG9Lj";

// YEARLY BONDS
// 3. RED
let nameRed = "Project Evergreen";
let symbolRed = "RED";
let numberOfBondsRed = 15;
let minCouponRed = 1;
let maxCouponRed = 5;
let closingDateRed = 1630321200; // Monday August 30, 12:00
let termRed = 1; // 1 year
let couponsPerYearRed = 2 // semiannual
let baseURIRed = "https://ipfs.io/ipfs/QmTYVFgAhC5Sc4ZHzyaauwdYi6BfTCZ4hBoXdXhxjQph1u";

// 4. YELLOW
let nameYellow = "Project Supernova";
let symbolYellow = "YELLOW";
let numberOfBondsYellow = 10;
let minCouponYellow = 1;
let maxCouponYellow = 10;
let closingDateYellow = 1630321200; // Monday August 30, 12:00
let termYellow = 2; // 1 year
let couponsPerYearYellow = 1 // annual
let baseURIYellow = "https://ipfs.io/ipfs/QmNYTN7gbG7zrJkCa1ToDW6A8qJqqBKAf7JDfML6bgmDLT";

                  
module.exports = async function (deployer) {
    // DEPLOYMENT TO GANACHE
    
    /*
    // DAILY BONDS
    await deployer.deploy(BondBlue, companyGanache, nameBlue, symbolBlue, numberOfBondsBlue, 
        minCouponBlue, maxCouponBlue, closingDateBlue, termBlue, couponsPerTermBlue ,baseURIBlue);

    await deployer.deploy(BondPurple, companyGanache, namePurple, symbolPurple, numberOfBondsPurple, 
        minCouponPurple, maxCouponPurple, closingDatePurple, termPurple, couponsPerTermPurple, baseURIPurple)

    
    // YEARLY BONDS
    await deployer.deploy(BondRed, companyGanache, nameRed, symbolRed, numberOfBondsRed, 
        minCouponRed, maxCouponRed, closingDateRed, termRed, couponsPerYearRed, baseURIRed);

    await deployer.deploy(BondYellow, companyGanache, nameYellow, symbolYellow, numberOfBondsYellow, 
        minCouponYellow, maxCouponYellow, closingDateYellow, termYellow, couponsPerYearYellow, baseURIYellow)
    */

    // // DEPLOYMENT TO Ropsten
    // DAILY BONDS
    /*
    await deployer.deploy(BondBlue, companyRopsten, nameBlue, symbolBlue, numberOfBondsBlue, 
        minCouponBlue, maxCouponBlue, closingDateBlue, termBlue, couponsPerTermBlue ,baseURIBlue);
    */
    /*
    await deployer.deploy(BondPurple, companyRopsten, namePurple, symbolPurple, numberOfBondsPurple, 
        minCouponPurple, maxCouponPurple, closingDatePurple, termPurple, couponsPerTermPurple, baseURIPurple)
    */
    
    // YEARLY BONDS
    /*
    await deployer.deploy(BondRed, companyRopsten, nameRed, symbolRed, numberOfBondsRed, 
        minCouponRed, maxCouponRed, closingDateRed, termRed, couponsPerYearRed, baseURIRed);
    */
    
    /*
    await deployer.deploy(BondYellow, companyRopsten, nameYellow, symbolYellow, numberOfBondsYellow, 
        minCouponYellow, maxCouponYellow, closingDateYellow, termYellow, couponsPerYearYellow, baseURIYellow)
    */
}

   