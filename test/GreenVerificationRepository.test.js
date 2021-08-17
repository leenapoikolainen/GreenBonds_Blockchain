const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')



const GreenVerificationRepository = artifacts.require('GreenVerificationRepository');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('GreenVerificationRepository', function (accounts) {
    const verifier = accounts[1];
    const investor = accounts[2];
    const symbol = "GREEN";
    let repository;
   
 
    beforeEach(async function() {
        repository = await GreenVerificationRepository.new({from: verifier});  
    });

    
    it('deploys successfully', async function() {
        const address = await repository.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    }) 

    
    it('has the right details', async function() {
        let role = await repository.getOwner() 
        assert.equal(role, verifier)
    })

    it('can add verification', async function() {  
        // Only green verifier/owner can add results
        await repository.addVerification(symbol, 0, {from: investor}).should.be.rejected;


        
        // Result is recorded correctly
        let result = await repository.addVerification(symbol, 1, {from: verifier})
        const verificationCreation = result.logs[0].args;
        const verificationEvent = result.logs[1].args;
        
        // Get address
        // Requires a symbol that has verificatiom
        await repository.getVerificationAddress("NOASYMBOL").should.be.rejected
        let address = await repository.getVerificationAddress(symbol);
        
        // Address is correct
        assert.equal(verificationCreation.verification, address)
        
        // Verification details are correct
        assert.equal(verificationEvent.symbol, symbol)
        assert.equal(verificationEvent.result, 1)
        
    })
    it('can read the results', async function() {
        // Record results
        await repository.addVerification(symbol, 0, {from: verifier})
        await repository.addVerification(symbol, 0, {from: verifier})
        await repository.addVerification(symbol, 2, {from: verifier})

        await repository.getNumberOfResults("NOTASYMBOL").should.be.rejected
        let results = await repository.getNumberOfResults(symbol)
        assert.equal(results, 3)

        await repository.getResult("NOTASYMBOL", 1).should.be.rejected
        let result1 = await repository.getResult(symbol, 1)
        assert.equal(result1, 0)
        
        let result3 = await repository.getResult(symbol, 3)
        assert.equal(result3, 2) 

        await repository.getResults("NOTASYMBOL").should.be.rejected
        let resultList = await repository.getResults(symbol)
        assert.isDefined(resultList)
    })
    
})