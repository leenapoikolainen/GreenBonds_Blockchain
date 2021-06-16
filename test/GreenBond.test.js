const { expect, assert } = require('chai');

const GreenBond = artifacts.require('GreenBond');

contract('GreenBond', function () {
    let bond;
    beforeEach(async function() {
        bond = await GreenBond.new("Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/",
        "0x3331d4e0c9d9a34edd4031ee03d0f7642e29b729", 100, 5);
    });

    it('has the right name and symbol', async function () {
        const name = await bond.name();
        const symbol = await bond.symbol();
        assert.equal(name, 'Green Bond')
        assert.equal(symbol, "GREEN")
    })
})