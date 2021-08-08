const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')


const GreenVerification = artifacts.require('GreenVerification2');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('GreenVerification', function (accounts) {
    const verifier = accounts[1];
    const investor = accounts[2];
    const symbol = "GREEN";
   
 
    beforeEach(async function() {
        verification = await GreenVerification.new(symbol, {from: verifier});  
    });

    it('deploys successfully', async function() {
        const address = await verification.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    }) 

    it('has the right details', async function() {

        let role = await verification.getOwner() 
        assert.equal(role, verifier)

        let bond = await verification.getBond()
        assert.equal(bond, symbol)
    })
    it('can add and read results', async function() {
        // Only green verifier/owner can add results
        await verification.addResult(0, {from: investor}).should.be.rejected;

        // Need to vote between set option 0 - 2
        await verification.addResult(3, {from: verifier}).should.be.rejected

        // Result is recorded correctly
        let result = await verification.addResult(0, {from: verifier})
        const event = result.logs[0].args;
        assert.equal(event.recordedResult, 0)
        
        result = await verification.getResult(1)
        assert.equal(result, 0)
        
        await verification.addResult(2, {from: verifier})
        result = await verification.getResult(2)
        assert.equal(result, 2)

        let numberOfResults = await verification.getNumberOfResults()
        assert.equal(numberOfResults, 2)
    })

})