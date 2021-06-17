const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')

const GreenBond = artifacts.require('GreenBond');

contract('GreenBond' ,function (accounts) {
    let bond;
    const owner = accounts[3];
    const investor = accounts[1];
    const investor2 = accounts[2];
    const company = accounts[9];

    beforeEach(async function() {
        bond = await GreenBond.new("Green Bond", "GREEN", "https://storage.cloud.google.com/metadata_platform/",
        company, 1000, 1, {from: owner});
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

   
    it('Investors can request an investment', async function() {
        // Track the recorded investments
        let investmentBefore = await bond.getInvestorBalance(investor)
        investmentBefore = new web3.utils.BN(investmentBefore)

        // Investor invokes the method
        let result = await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')})
        const event = result.logs[0].args;
    
        
        // Check the event details (right investor and right amount logged)
        assert.equal(event.value.toNumber(), 1000)
        assert.equal(event.investor, investor)
        
        
        let paidAmount = web3.utils.toWei('1000', 'Wei')
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
        let result = await bond.registerInvestment(2, {from: investor, value: web3.utils.toWei('2000', 'Wei')})
        const event = result.logs[0].args;
   
        // Check the event details (right investor and right amount logged)
        assert.equal(event.value.toNumber(), 2000)
        assert.equal(event.investor, investor) 

        let paidAmount = web3.utils.toWei('2000', 'Wei')
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

    it('Issuing tokens with general function', async function() {
        // First make the investor request investment
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')})
        await bond.registerInvestment(1, {from: investor2, value: web3.utils.toWei('1000', 'Wei')})
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')})
        
        // Track balance of the company before the token issuance
        let oldBalance = await web3.eth.getBalance(company)
        oldBalance = new web3.utils.BN(oldBalance) 

        // Store the result and get the transfer event
        let result = await bond.issueTokens({from: owner})
        const transfer1 = result.logs[0].args;
        const transfer2 = result.logs[1].args;
        const transfer3 = result.logs[2].args;

        // Has the right token id
        assert.equal(transfer1.tokenId, 0)
        assert.equal(transfer2.tokenId, 1)
        assert.equal(transfer3.tokenId, 2)

        // Has the right token owner
        assert.equal(transfer1.to, investor)
        assert.equal(transfer2.to, investor)
        assert.equal(transfer3.to, investor2)

        // Check new balance of the company after the token issue
        let newBalance = await web3.eth.getBalance(company)
        newBalance = new web3.utils.BN(newBalance)

        let paidAmount = web3.utils.toWei('3000', 'Wei')
        paidAmount = new web3.utils.BN(paidAmount)

        const expectedBalance = oldBalance.add(paidAmount)
        assert.equal(newBalance.toString(), expectedBalance.toString())

        
        // Check the investors balance after the token issue
        let investmentBalanceAfter1 = await bond.getInvestorBalance(investor)
        investmentBalanceAfter1 = new web3.utils.BN(investmentBalanceAfter1)

        let investmentBalanceAfter2 = await bond.getInvestorBalance(investor2)
        investmentBalanceAfter2 = new web3.utils.BN(investmentBalanceAfter2)

        // Compare to the expected investment balance
        const expectedInvestment = 0
        assert.equal(investmentBalanceAfter1.toString(), expectedInvestment.toString())
        assert.equal(investmentBalanceAfter2.toString(), expectedInvestment.toString())
    
    })

    it('Extra investment amount will be returned to the investor', async function() {
        // Make an investment
        await bond.registerInvestment(1, {from: investor2, value: web3.utils.toWei('1500', 'Wei')} )

        // Record investor balance
        let balanceAfterInvestment = await web3.eth.getBalance(investor2)
        balanceAfterInvestment = new web3.utils.BN(balanceAfterInvestment) 
        
        // Issue tokens
        await bond.issueTokens({from: owner})

        // Check new balance
        let newBalance = await web3.eth.getBalance(investor2)
        newBalance = new web3.utils.BN(newBalance)

        // Expected differenece on the balance
        let difference = web3.utils.toWei('500', 'Wei')
        difference = new web3.utils.BN(difference)

        let expectedBalance = balanceAfterInvestment.add(difference)
        assert.equal(newBalance.toString(), expectedBalance.toString())
    })

    it('Paying coupons', async function() {
        // Make investments
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')})
        await bond.registerInvestment(1, {from: investor2, value: web3.utils.toWei('1000', 'Wei')})

        // Issue tokens
        await bond.issueTokens({from: owner})

        // Record investor's balance before the coupon payment
        let oldBalance1 = await web3.eth.getBalance(investor)
        oldBalance1 = new web3.utils.BN(oldBalance1)

        let oldBalance2 = await web3.eth.getBalance(investor2)
        oldBalance2 = new web3.utils.BN(oldBalance2)

        // Pay coupon to investors
        let result = await bond.payCoupons({from: company, value: web3.utils.toWei('2', 'Wei')})
        const coupon1 = result.logs[0].args;
        const coupon2 = result.logs[1].args;

        // Check event details
        assert.equal(coupon1.investor, investor)
        assert.equal(coupon1.tokenId, 0)

        assert.equal(coupon2.investor, investor2)
        assert.equal(coupon2.tokenId, 1)

        // Check new balance of the investor after the coupon payment
        let newBalance1 = await web3.eth.getBalance(investor)
        newBalance1 = new web3.utils.BN(newBalance1)

        let newBalance2 = await web3.eth.getBalance(investor2)
        newBalance2 = new web3.utils.BN(newBalance2)

        // Mock the paid amount
        let couponPayment = web3.utils.toWei('1', 'Wei')
        couponPayment = new web3.utils.BN(couponPayment)

        const expectedBalance1 = oldBalance1.add(couponPayment)
        assert.equal(newBalance1.toString(), expectedBalance1.toString())
        
        const expectedBalance2 = oldBalance2.add(couponPayment)
        assert.equal(newBalance2.toString(), expectedBalance2.toString())
    })

    it('Tokens and money transferred at maturity', async function() {
        // Make an investment
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')})

        // Issue tokens
        await bond.issueTokens({from: owner})


        // Record investor's balance before the principal payback
        let oldBalance = await web3.eth.getBalance(investor)
        oldBalance = new web3.utils.BN(oldBalance)

        // Paying back bond
        let result = await bond.payBackBond({from: company, value: web3.utils.toWei('1000', 'Wei')})
        const transfer = result.logs[0].args;

        // Check transfer and the right owner of the token 
        assert.equal(transfer.tokenId, 0)
        let ownerOfToken = await bond.ownerOf(0)
        assert.equal(ownerOfToken, owner)

        // Check investor's balance after
        let newBalance = await web3.eth.getBalance(investor)
        newBalance = new web3.utils.BN(newBalance)

        let principalPayment = web3.utils.toWei('1000', 'Wei')
        principalPayment = new web3.utils.BN(principalPayment)

        const expectedBalance = oldBalance.add(principalPayment)
        assert.equal(newBalance.toString(), expectedBalance.toString())
        

    })
    /*
    it('Paying coupons', async function () {
        // Make an investments
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')})
        await bond.registerInvestment(1, {from: investor2, value: web3.utils.toWei('1000', 'Wei')} )
        
        // Issue tokens
        await bond.issueTokens(1, investor, {from: owner})
        await bond.issueTokens(1, investor2, {from: owner})

        // Record investor's balance before the coupon payment
        let oldBalance1 = await web3.eth.getBalance(investor)
        oldBalance1 = new web3.utils.BN(oldBalance1)

        let oldBalance2 = await web3.eth.getBalance(investor2)
        oldBalance2 = new web3.utils.BN(oldBalance2)

        // Pay coupon to investors
        let result = await bond.payCoupons({from: company, value: web3.utils.toWei('2', 'Wei')})
        const coupon1 = result.logs[0].args;
        const coupon2 = result.logs[1].args;
        
        // Check event details
        assert.equal(coupon1.investor, investor)
        assert.equal(coupon1.tokenId, 0)

        assert.equal(coupon2.investor, investor2)
        assert.equal(coupon2.tokenId, 1)

        // Check new balance of the investor after the coupon payment
        let newBalance1 = await web3.eth.getBalance(investor)
        newBalance1 = new web3.utils.BN(newBalance1)

        let newBalance2 = await web3.eth.getBalance(investor2)
        newBalance2 = new web3.utils.BN(newBalance2)

        // Mock the paid amount
        let couponPayment = web3.utils.toWei('1', 'Wei')
        couponPayment = new web3.utils.BN(couponPayment)

        const expectedBalance1 = oldBalance1.add(couponPayment)
        assert.equal(newBalance1.toString(), expectedBalance1.toString())
        
        const expectedBalance2 = oldBalance2.add(couponPayment)
        assert.equal(newBalance2.toString(), expectedBalance2.toString())
    })
*/
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

        /*
    it('Issuing one token transfers coins and token ownership correctly', async function () {
        // First make the investor request investment
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1', 'Wei')})
        
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

    it('Issuing multiple tokens transfers coins and token ownership correctly', async function() {
        // First make the investor request investment
        await bond.registerInvestment(2, {from: investor, value: web3.utils.toWei('2', 'Wei')})
        
        // Track balance of the company before the token issuance
        let oldBalance = await web3.eth.getBalance(company)
        oldBalance = new web3.utils.BN(oldBalance)

        // Track the recorded investments
        let investmentBalance = await bond.getInvestorBalance(investor)
        investmentBalance = new web3.utils.BN(investmentBalance)
      
        // Store the result and get the transfer event
        let result = await bond.issueTokens(2, investor)
        const transfer1 = result.logs[0].args;
        const transfer2 = result.logs[1].args;

        // Has the right token id
        assert.equal(transfer1.tokenId, 0)
        assert.equal(transfer2.tokenId, 1)
        // Has the right token owner
        assert.equal(transfer1.to, investor)
        assert.equal(transfer2.to, investor)

        
        // Check new balance of the company after the token issue
        let newBalance = await web3.eth.getBalance(company)
        newBalance = new web3.utils.BN(newBalance)

        let paidAmount = web3.utils.toWei('2', 'Wei')
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
    */
})