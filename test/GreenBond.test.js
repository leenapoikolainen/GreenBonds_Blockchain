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

    describe('deployment', async () => {
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
    })

   
    it('Investors can request investment', async function() {
        // Track the recorded investments
        let investmentBefore = await bond.getInvestorBalance(investor)
        investmentBefore = new web3.utils.BN(investmentBefore)

        // Investor invokes the method
        let result = await bond.invest(1, {from: investor, value: web3.utils.toWei('1', 'Wei')})
        const event = result.logs[0].args;
    
        
        // Check the event details (right investor and right amount logged)
        assert.equal(event.value.toNumber(), 1)
        assert.equal(event.investor, investor)
        
        
        let paidAmount = web3.utils.toWei('1', 'Wei')
        paidAmount = new web3.utils.BN(paidAmount)
        
        let value = new web3.utils.BN(event.value)
        assert.equal(value.toString(), paidAmount.toString())

        // Check new investment balance
        let investmentAfter = await bond.getInvestorBalance(investor)
        investmentAfter = new web3.utils.BN(investmentAfter)

        // Compare to the expected investment balance
        const expectedInvestment = investmentBefore.add(paidAmount)
        assert.equal(investmentAfter.toString(), expectedInvestment.toString())
        
    })

    it('Investors can request multiple investments', async function() {
        // Track the recorded investments
        let investmentBefore = await bond.getInvestorBalance(investor)
        investmentBefore = new web3.utils.BN(investmentBefore)

        // Investor invokes the method
        let result = await bond.invest(2, {from: investor, value: web3.utils.toWei('2', 'Wei')})
        const event = result.logs[0].args;
   
        // Check the event details (right investor and right amount logged)
        assert.equal(event.value.toNumber(), 2)
        assert.equal(event.investor, investor)
        

        let paidAmount = web3.utils.toWei('2', 'Wei')
        paidAmount = new web3.utils.BN(paidAmount)
        
        let value = new web3.utils.BN(event.value)
        assert.equal(value.toString(), paidAmount.toString())

        // Check new investment balance
        let investmentAfter = await bond.getInvestorBalance(investor)
        investmentAfter = new web3.utils.BN(investmentAfter)

        // Compare to the expected investment balance
        const expectedInvestment = investmentBefore.add(paidAmount)
        assert.equal(investmentAfter.toString(), expectedInvestment.toString())
        
    })

    it('Investment in tokens transfers coins and token ownership', async function () {
        // First make the investor request investment
        await bond.invest(1, {from: investor, value: web3.utils.toWei('1', 'Wei')})
        
        // Track balance of the company
        let oldBalance = await web3.eth.getBalance(company)
        oldBalance = new web3.utils.BN(oldBalance)

        // Track the recorded investments
        let investmentBalance = await bond.getInvestorBalance(investor)
        investmentBalance = new web3.utils.BN(investmentBalance)
      
        // Store the result and get the transfer event
        let result = await bond.issueTokens(1, investor)
        const event = result.logs[0].args;

        // Has the right token id
        assert.equal(event.tokenId, 0)
        // Has the right token owner
        assert.equal(event.to, investor)

        // Check new balance of the company after the token issue
        let newBalance = await web3.eth.getBalance(company)
        newBalance = new web3.utils.BN(newBalance)

        let paidAmount = web3.utils.toWei('1', 'Wei')
        paidAmount = new web3.utils.BN(paidAmount)

        const expectedBalance = oldBalance.add(paidAmount)
        assert.equal(newBalance.toString(), expectedBalance.toString())

        // Check the investor balance after the token issue
        let investmentBalanceAfter = await bond.getInvestorBalance(investor)
        investmentBalanceAfter = new web3.utils.BN(investmentBalanceAfter)

        // Compare to the expected investment balance
        const expectedInvestment = investmentBalance - paidAmount;
        assert.equal(investmentBalanceAfter.toString(), expectedInvestment.toString())
    })

    it('Paying coupons', async function () {
        // Make an investment
        await bond.invest(1, {from: investor, value: web3.utils.toWei('1', 'Wei')})
        
        // Issue tokens
        await bond.issueTokens(1, investor)

        // Record investor's balance before the coupon payment
        let oldBalance = await web3.eth.getBalance(investor)
        oldBalance = new web3.utils.BN(oldBalance)

        // Pay coupon to investors
        let result = await bond.payCoupons({from: company, value: web3.utils.toWei('1', 'Wei')})
        const event = result.logs[0].args;
        
        // Check event details
        assert.equal(event.investor, investor)
        assert.equal(event.tokenId, 0)

        // Check new balance of the investor after the coupon payment
        let newBalance = await web3.eth.getBalance(investor)
        newBalance = new web3.utils.BN(newBalance)

        // Mock the paid amount
        let couponPayment = web3.utils.toWei('1', 'Wei')
        couponPayment = new web3.utils.BN(couponPayment)

        const expectedBalance = oldBalance.add(couponPayment)
        assert.equal(newBalance.toString(), expectedBalance.toString())

    })

    /*
    it('Issuing tokens transfers value correctly', async function () {
        // Track balance of the company
        let oldBalance = await web3.eth.getBalance(company)
        oldBalance = new web3.utils.BN(oldBalance)
       
        // Store the result and get the transfer event
        let result = await bond.issueTokens(1, investor, {from: owner, value: web3.utils.toWei('1', 'Ether')})
        const event = result.logs[0].args;

        // Has the right token id
        assert.equal(event.tokenId, 0)
        // Has the right token owner
        assert.equal(event.to, investor)
        
        // Check new balance of the company after the token issue
        let newBalance = await web3.eth.getBalance(company)
        newBalance = new web3.utils.BN(newBalance)

        let paidAmount = web3.utils.toWei('1', 'Ether')
        paidAmount = new web3.utils.BN(paidAmount)

        const expectedBalance = oldBalance.add(paidAmount)
        assert.equal(newBalance.toString(), expectedBalance.toString())
    })
    */
})