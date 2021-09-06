// DAILY BONDS
const BondPurple = artifacts.require("BondPurple");
const BondBlue = artifacts.require("BondBlue");
const BondWhite = artifacts.require("BondWhite")

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

// Additional daily bond
// 4. WHITE
let nameWhite = "Project Swiss";
let symbolWhite = "WHITE";
let numberOfBondsWhite = 10;
let minCouponWhite = 1;
let maxCouponWhite = 10;
let closingDateWhite = 	1631098800; // Wednesday September 8, 12:00
let termWhite = 5; // 5 days
let couponsPerTermWhite = 1 // daily
let baseURIWhite= "https://ipfs.io/ipfs/QmPBPBNLGAg75hrubbkL1Xf9qmgxsUbAAXgdThNMr8STfq";

                  
module.exports = async function (deployer) {
    // DEPLOYMENT TO GANACHE
   /*
    await deployer.deploy(BondWhite, companyGanache, nameWhite, symbolWhite, numberOfBondsWhite,
        minCouponWhite, maxCouponWhite, closingDateWhite, termWhite, couponsPerTermWhite, baseURIWhite)
    
    
 
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
    
    /*
    await deployer.deploy(BondWhite, companyRopsten, nameWhite, symbolWhite, numberOfBondsWhite,
        minCouponWhite, maxCouponWhite, closingDateWhite, termWhite, couponsPerTermWhite, baseURIWhite)
    
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

   