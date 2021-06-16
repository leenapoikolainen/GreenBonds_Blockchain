const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')

const GreenBond = artifacts.require('GreenBond');

contract('GreenBond' ,function (accounts) {
    let bond;
    const owner = accounts[0];
    const investor = accounts[1];
    const company = accounts[9];
    beforeEach(async function() {
        bond = await GreenBond.new("Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/",
        company, 1, 1);
    });

    it('deploys successfully', async function() {
        const address = await bond.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it('has the right name and symbol', async function () {
        const name = await bond.name();
        const symbol = await bond.symbol();
        assert.equal(name, 'Green Bond')
        assert.equal(symbol, "GREEN")
    })

    it('Issuing tokens transfers value correctly', async function () {
        // Track balance of the company
        let oldBalance = await web3.eth.getBalance(company)
        oldBalance = new web3.utils.BN(oldBalance)
       
        let result = await bond.issueTokens(1, investor, {from: owner, value: web3.utils.toWei('1', 'Ether')})
        const event = result.logs[0].args;
        // Has the right token id
        assert.equal(event.tokenId, 0)
        // Has the right token owner
        assert.equal(event.to, investor)
        
        let newBalance = await web3.eth.getBalance(company)
        newBalance = new web3.utils.BN(newBalance)
        //console.log(newBalance)

        let paidAmount = web3.utils.toWei('1', 'Ether')
        paidAmount = new web3.utils.BN(paidAmount)

        const expectedBalance = oldBalance.add(paidAmount)
        assert.equal(newBalance.toString(), expectedBalance.toString())
    })
})