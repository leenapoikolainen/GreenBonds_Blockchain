const Box = artifacts.require("Box");
const GameItem = artifacts.require("GameItem");
const SimpleCollectible = artifacts.require("SimpleCollectible");
const Bond = artifacts.require("Bond")
const GreenBond = artifacts.require("GreenBond")

module.exports = async function (deployer) {
    await deployer.deploy(Box);
    await deployer.deploy(GameItem);
    await deployer.deploy(SimpleCollectible);
    await deployer.deploy(Bond, 10, 100);
    await deployer.deploy(GreenBond, "Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/")
}