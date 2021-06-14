const { expect } = require('chai');

const Box = artifacts.require('Box');

contract('Box', function () {
    beforeEach(async function() {
        this.box = await Box.new();
    });

    it('retrieve returns a value previously stored', async function () {
        await this.box.store(42);

        expect((await this.box.retrieve()).toString()).to.equal('42');
    })
})