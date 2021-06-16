/*
const { expect } = require('chai');

const Bond = artifacts.require('Bond');

contract('Bond', function () {
    beforeEach(async function() {
        this.bond = await Bond.new(10, 1000);
    });


    it('has the right value', async function () {
        //const value = await this.bond.getValue()
        expect((await this.bond.getValue()).toString()).to.equal('1000');
    })

    it('minting', async function() {
        this.bond.createTokens()
        const owner = this.bond.getOwner()
        this.bond.balanceOf(owner)
        //this.bond.balanceOf(this.bond)
        //this.bond.ownerOf(0) Does not work off chain
    })

})
*/