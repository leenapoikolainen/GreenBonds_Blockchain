const GreenBond = artifacts.require("GreenBond")
const GreenBond2 = artifacts.require("GreenBond2");
const GreenBond3 = artifacts.require("GreenBond3");
const GreenCertifier = artifacts.require("GreenCertifier");
const GreenCertificate = artifacts.require("GreenCertificate");
const BondPriceAuction = artifacts.require("BondPriceAuction");
const GreenVerificationRepo = artifacts.require("GreenVerificationRepository")


// Variables for green bond constructor
//let company = "0xe5dc3eFEcDc0f2Ee5672Fa287CE80733F81FCB78"; // Ropsten 2 on MetaMask
let company = "0x94ef9712F0C40CF8a1786944DcE2399df547853b"; // Ganache account 10
let name = "Project1";
let symbol = "GREEN";
let numberOfBondsSeeked = 10;
let minCoupon = 1;
let maxCoupon = 5;
let closingDate = 1628691300; // Aug 11 2021 15:15:00 GMT+0100 (British Summer Time)
let term = 1; // 1 year
let couponsPerYear = 2 // semiannual
let baseURI = "https://storage.cloud.google.com/metadata_platform/";


// Variables for greenbond3
let company2 = "0x94ef9712F0C40CF8a1786944DcE2399df547853b"; // Ganache account 10
let name2 = "Daily Coupons"
let symbol2 = "BLUE";
let numberOfBondsSeeked2 = 5;
let minCoupon2 = 2;
let maxCoupon2 = 8;
let closingDate2 = 1628775780;
let term2 = 3; // 3 days
let couponsPerYear2 = 1; // daily
let baseURI2 = "test";


            
       
module.exports = async function (deployer) {
    //await deployer.deploy(GreenBond, company, name, symbol, numberOfBondsSeeked, minCoupon, maxCoupon, closingDate,
    //    term, couponsPerYear, baseURI);
    //await deployer.deploy(GreenBond2, company, name, symbol, numberOfBondsSeeked, minCoupon, maxCoupon, closingDate,
    //    term, couponsPerYear, baseURI);
    
    await deployer.deploy(GreenBond3, company2, name2, symbol2, numberOfBondsSeeked2, minCoupon2, maxCoupon2, closingDate2,
        term2, couponsPerYear2, baseURI2);
    
    //await deployer.deploy(GreenVerificationRepo);

    //await deployer.deploy(GreenBond, name, symbol, baseURI, company, faceValue, couponRate, issueDate, term, couponsPerYear);
    //await deployer.deploy(GreenBond, "Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/",
    //"0xe5dc3eFEcDc0f2Ee5672Fa287CE80733F81FCB78", 100, 1, 1625558400);
    //await deployer.deploy(GreenCertifier);
    //await deployer.deploy(GreenCertificate,"0x3331d4e0c9d9a34edd4031ee03d0f7642e29b729");
}