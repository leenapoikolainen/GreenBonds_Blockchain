const GreenBond2 = artifacts.require("GreenBond2");
const GreenBond3 = artifacts.require("GreenBond3");
const BondPurple = artifacts.require("BondPurple");
const BondBlue = artifacts.require("BondBlue")
const BondRopsten = artifacts.require("BondRopsten");
const GreenCertifier = artifacts.require("GreenCertifier");
const GreenCertificate = artifacts.require("GreenCertificate");
const GreenVerificationRepo = artifacts.require("GreenVerificationRepository")
const GreenCertificationRepo = artifacts.require("GreenCertificateRepository")


// Variables for greenBond2 - RED
//let company = "0xe5dc3eFEcDc0f2Ee5672Fa287CE80733F81FCB78"; // Ropsten 2 on MetaMask
let company = "0x10A46e292b93721723854034Ea6f45d15C548CE9"; // Ganache account 8
let name = "Project Evergreen";
let symbol = "RED";
let numberOfBondsSeeked = 15;
let minCoupon = 1;
let maxCoupon = 5;
let closingDate = 1629279000; 
let term = 1; // 1 year
let couponsPerYear = 2 // semiannual
let baseURI = "https://ipfs.io/ipfs/QmTYVFgAhC5Sc4ZHzyaauwdYi6BfTCZ4hBoXdXhxjQph1u";


// Variables for greenbond3 - BLUE
let company2 = "0x94ef9712F0C40CF8a1786944DcE2399df547853b"; // Ganache account 10
let name2 = "Daily Coupons"
let symbol2 = "BLUE";
let numberOfBondsSeeked2 = 5;
let minCoupon2 = 2;
let maxCoupon2 = 8;
let closingDate2 = 1629218400
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


            
       
module.exports = async function (deployer) {

    // ROPSTEN BOND - daily
    /*
    await deployer.deploy(BondRopsten, company4, name4, symbol4, numberOfBondsSeeked4, minCoupon4, maxCoupon4, closingDate4,
        term4, couponsPerTerm4, baseURI4);
    */
   
    // RED BOND - yearly
    /*
    await deployer.deploy(GreenBond2, company, name, symbol, numberOfBondsSeeked, minCoupon, maxCoupon, closingDate,
        term, couponsPerYear, baseURI);
    */    

    //  BLUE - yearly
    /*
    await deployer.deploy(BondBlue, company2, name2, symbol2, numberOfBondsSeeked2, minCoupon2, maxCoupon2, closingDate2,
        term2, couponsPerYear2, baseURI2);
    */

    // PURPLE BOND
    /*
    await deployer.deploy(BondPurple, company3, name3, symbol3, numberOfBondsSeeked3, minCoupon3, maxCoupon3, closingDate3,
        term3, couponsPerTerm3, baseURI3)
    
    */
    // GREEN VERIFICATION REPO
    
    await deployer.deploy(GreenVerificationRepo);
    

    // GREEN CERTIFICATION REPO - Deployed to Ropsten and Ganache on 19th August
    /*
    await deployer.deploy(GreenCertificationRepo)
    */


}