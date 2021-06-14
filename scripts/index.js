module.exports = async function main(callback) {
    try {
        const Box = artifacts.require("Box");
        const box = await Box.deployed();

        value = await box.retrieve();
        console.log("Box value is", value.toString());

        await box.store(23);
        value = await box.retrieve();
        console.log("Box value is", value.toString());

        const Game = artifacts.require("GameItem");
        const game = await Game.deployed();

        _name = await game.name();
        console.log("Name is", _name);

        callback(0);
    } catch (error) {
        console.error(error);
        callback(1);
    }
}