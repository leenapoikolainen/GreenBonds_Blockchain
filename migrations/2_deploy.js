const GreenBond = artifacts.require("GreenBond")
const GreenCertifier = artifacts.require("GreenCertifier");
const GreenCertificate = artifacts.require("GreenCertificate");

module.exports = async function (deployer) {
    await deployer.deploy(GreenBond, "Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/",
    "0xe5dc3eFEcDc0f2Ee5672Fa287CE80733F81FCB78", 100, 1);
    //await deployer.deploy(GreenCertifier);
    //await deployer.deploy(GreenCertificate,"0x3331d4e0c9d9a34edd4031ee03d0f7642e29b729");
}