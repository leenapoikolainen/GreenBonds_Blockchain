const GreenBond = artifacts.require("GreenBond")

module.exports = async function (deployer) {
    await deployer.deploy(GreenBond, "Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/")
}