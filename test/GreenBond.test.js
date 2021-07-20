const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')
const timeMachine = require('ganache-time-traveler');

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
}



const GreenBond = artifacts.require('GreenBond');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('GreenBond', function (accounts) {
    let bond;
    let bondName = "Green Bond";
    let bondSymbol = "GREEN";
    let baseURI = "https://storage.cloud.google.com/metadata_platform/";
    //let faceValue = 1000;
    let numberOfBondsSeeked = 10;
    let minCoupon = 1;
    let maxCoupon = 5;
    let bidClosingTime = Math.floor(new Date().getTime() / 1000) + duration.days(2)
    let issueDate = bidClosingTime + duration.weeks(1)
    //let issueDate = Math.floor(new Date().getTime() / 1000) + duration.days(2)
    //let term = 31557600 * 2 // 2 years
    let term = 2;
    //let maturity = issueDate + duration.years(term)

    let couponsPerYear = 2 // semiannual
    const owner = accounts[0];
    const investor = accounts[1];
    const investor2 = accounts[2];
    const investor3 = accounts[3];
    const regulator = accounts[4];
    const company = accounts[8];

    // Changed from beforeEach to before
    before(async function () {
        bond = await GreenBond.new(company, bondName, bondSymbol, numberOfBondsSeeked, minCoupon, maxCoupon,
            bidClosingTime, term, couponsPerYear, baseURI, { from: owner});
            
    });

    describe('deployment', async () => {
        it('deploys successfully', async function () {
            const address = await bond.address
            assert.notEqual(address, 0x0)
            assert.notEqual(address, "")
            assert.notEqual(address, null)
            assert.notEqual(address, undefined)
        })
        it('has the right name and symbol', async function () {
            const name = await bond.name();
            const symbol = await bond.symbol();
            assert.equal(name, 'Green Bond')
            assert.equal(symbol, "GREEN")
        })
        it('has the right value and coupons', async function () {
            const _value = await bond.getFaceValue()
            const _coupon = await bond.getCoupon()
            const _minCoupon = await bond.getMinCoupon()
            const _maxCoupon = await bond.getMaxCoupon()
            assert.equal(_value.toNumber(), 100)
            assert.equal(_coupon.toNumber(), 0)
            assert.equal(_minCoupon.toNumber(), 1)
            assert.equal(_maxCoupon.toNumber(), 5)
        })
        it('has the right bid closing time', async function () {
            const closingTime = await bond.getBidClosingTime()
            assert.equal(closingTime, bidClosingTime)
        })
        it('Has the right issue date, maturity date and coupon dates', async function () {
            const maturityDate = await bond.getMaturityDate()
            const issuingDay = await bond.getIssueDate()
            assert.equal(maturityDate.toNumber(), issueDate + duration.years(term))
            assert.equal(issueDate, issuingDay)

            /*
            let date = new Date(issuingDay * 1000)
            console.log(date)

            date = new Date(maturityDate * 1000)
            console.log(date)
            */

            let couponDate = await bond.getCouponDate(1);
            assert.equal(couponDate, issueDate + duration.years(0.5))
            couponDate = await bond.getCouponDate(2);
            assert.equal(couponDate, issueDate + duration.years(1))

        })
    })


    describe('Before bidding window is closed', () => {
        it('investors can bid when the bidding window is open', async function() {
            // Tracking the invested amount before the bid
            let investmentBefore = await bond.getInvestedAmountPerInvestor(investor)
            investmentBefore = new web3.utils.BN(investmentBefore)

            // Bidding outside the range is rejected
            await bond.registerBid(6, 1, {from: investor, value: web3.utils.toWei('100', 'Wei')}).should.be.rejected
            // Bid without enough eth should be rejected
            await bond.registerBid(5, 2, {from: investor, value: web3.utils.toWei('100', 'Wei')}).should.be.rejected
            
            // Register investment during bidding time  
            let result = await bond.registerBid(1, 2, {from: investor, value: web3.utils.toWei('200', 'Wei')})
            const bid = result.logs[0].args;
            assert.equal(bid.bidder, investor)
            assert.equal(bid.coupon, 1)
            assert.equal(bid.numberOfBonds, 2)

            // Check the investment balance
            let investedAmount = web3.utils.toWei('200', 'Wei')
            investedAmount = new web3.utils.BN(investedAmount)

            let investmentAfter = await bond.getInvestedAmountPerInvestor(investor)
            investmentAfter = new web3.utils.BN(investmentAfter)
    
            // Compare to the expected investment balance
            const expectedInvestment = investmentBefore.add(investedAmount)
            assert.equal(investmentAfter.toString(), expectedInvestment.toString())    
        })
        it('Issuing bonds is not possible when investment window is still open', async function() {
            // Test issuing tokens
            await bond.issueBonds({from: owner}).should.be.rejected
        })
        it('The bond count is 0 before issuing bonds', async function() {
            let count = await bond.bondCount()
            assert.equal(count.toNumber(), 0)
        })
        
        it('defining coupon is not possible, when bidding time is still open', async function() {
            await bond.defineCoupon({from: owner}).should.be.rejected
        })
        /*
        it('regulator can return investor investments from the contract', async function() {
            let balance = await web3.eth.getBalance(investor)
            balance = new web3.utils.BN(balance) 

            // Rejected if contract not paused
            await bond.returnInvestorMoney().should.be.rejected
            await bond.pause({from: regulator})
            // Rejected if not coming from regulator
            await bond.returnInvestorMoney().should.be.rejected
            
            // Return money
            await bond.returnInvestorMoney({from: regulator})

            let refund = web3.utils.toWei('3000', 'Wei')
            refund = new web3.utils.BN(refund)
            
            
            let balanceAfter = await web3.eth.getBalance(investor)
            balanceAfter = new web3.utils.BN(balanceAfter)

            const expectedBalance = balance.add(refund)
            assert.equal(balanceAfter.toString(), expectedBalance.toString())

            await bond.unpause({from: regulator})         
        })
        */
    })

    
    describe('After bidding time is over', () => {

        // SCENARIO WHEN DEMAND IS NOT MET

        /*
        before(async () => {
            // Make another investments
            await bond.registerBid(3, 2, {from: investor3, value: web3.utils.toWei('200', 'Wei')})
            
            // Record investor balance
            //balanceAfterInvestment = await web3.eth.getBalance(investor2)
            //balanceAfterInvestment = new web3.utils.BN(balanceAfterInvestment) 
            
            // Advance time
            await timeMachine.advanceTimeAndBlock(duration.days(2)); // + 2 week
        })
        
        it('coupon is 0 and all investors refunded when not enough demand', async function() {
            let result = await bond.defineCoupon({from: owner})
            let cancel = result.logs[0].args

            assert.equal(cancel.actualDemand, 4)
            assert.equal(cancel.requestedDemand, 10)

            const _coupon = await bond.getCoupon()
            assert.equal(_coupon.toNumber(), 0)

            let refund = result.logs[1].args
            assert.equal(refund.account, investor)
            assert.equal(refund.value, 200)

            refund = result.logs[2].args
            assert.equal(refund.account, investor3)
            assert.equal(refund.value, 200)
        })
        it('can not issue bonds, when issue has been cancelled', async function() {
            await bond.issueBonds({from: owner}).should.be.rejected
        })

        */


        // SCENARIO WHEN DEMAND IS  MET
        
        let balanceAfterInvestment

        before(async () => {
            // Make another investments
            await bond.registerBid(2, 10, {from: investor2, value: web3.utils.toWei('1000', 'Wei')})
            await bond.registerBid(3, 2, {from: investor3, value: web3.utils.toWei('200', 'Wei')})
            
            // Record investor balance
            //balanceAfterInvestment = await web3.eth.getBalance(investor2)
            //balanceAfterInvestment = new web3.utils.BN(balanceAfterInvestment) 
            
            // Advance time
            await timeMachine.advanceTimeAndBlock(duration.days(2)); // + 2 days
        })
        it('bidding not possible after bidding time is closed', async function() {
            await bond.registerBid(1, 1, {from: investor, value: web3.utils.toWei('100', 'Wei')}).should.be.rejected
        })
        
        
        it('coupon is set correctly and unsuccesful bidders are refunded', async function() {
            let result = await bond.defineCoupon({from: owner})
            let couponSet = result.logs[0].args
            assert.equal(couponSet.coupon, 2)

            let _coupon = await bond.getCoupon()
            assert.equal(_coupon.toNumber(), 2)

            
            // check refunds
            let refund = result.logs[1].args
            assert.equal(refund.account, investor3)
            assert.equal(refund.value, 200) 
        })

        it('bonds are issued correctly, last investor will get less', async function() {
            // Track balance of the company before the token issuance
            let oldBalance = await web3.eth.getBalance(company)
            oldBalance = new web3.utils.BN(oldBalance) 

            
            let result = await bond.issueBonds({from: owner})
     
            // first two transfers are for investor 1
            const transfer1 = result.logs[0].args;
            
            // remaining 8 are for investor 2
            const transfer3 = result.logs[2].args;

            // Has the right token id
            assert.equal(transfer1.tokenId, 0)
            assert.equal(transfer3.tokenId, 2)
        
            // Has the right token owner
            assert.equal(transfer1.to, investor)
            assert.equal(transfer3.to, investor2)
            
            // Refund
            const refund = result.logs[10].args
            assert.equal(refund.account, investor2)
            assert.equal(refund.value.toNumber(), 200)       

            let newBalance = await web3.eth.getBalance(company)
            newBalance = new web3.utils.BN(newBalance) 

            let principal = web3.utils.toWei('1000', 'Wei')
            principal = new web3.utils.BN(principal)
            
            let expectedBalance = oldBalance.add(principal)
            assert.equal(newBalance.toString(), expectedBalance.toString())
        })
        
        it('coupon payments are made correctly', async function() {
            
            // Record investors' balances before the coupon payment
            let oldBalance1 = await web3.eth.getBalance(investor)
            oldBalance1 = new web3.utils.BN(oldBalance1)
    
            let oldBalance2 = await web3.eth.getBalance(investor2)
            oldBalance2 = new web3.utils.BN(oldBalance2)

            // Only borrowing company can make payments
            await bond.payCoupons({from: owner, value: web3.utils.toWei('20', 'Wei')}).should.be.rejected
            // Not enough coins will not be accepted
            await bond.payCoupons({from: company, value: web3.utils.toWei('10', 'Wei')}).should.be.rejected

            // Pay coupons (coupon is 2, for 10 bonds)
            let result = await bond.payCoupons({from: company, value: web3.utils.toWei('20', 'Wei')})
            // First two coupons for investor 1, next 8 for investor 2
            const coupon1 = result.logs[0].args;
            const coupon3 = result.logs[2].args;
            
    
            // Check event details
            assert.equal(coupon1.investor, investor)
            assert.equal(coupon1.bondId, 0)   
        
            assert.equal(coupon3.investor, investor2)
            assert.equal(coupon3.bondId, 2)


            // Check new balance of the investor after the coupon payment
            let newBalance1 = await web3.eth.getBalance(investor)
            newBalance1 = new web3.utils.BN(newBalance1)
    
            let newBalance2 = await web3.eth.getBalance(investor2)
            newBalance2 = new web3.utils.BN(newBalance2)
    
            // Mock the paid amount
            let couponPayment = web3.utils.toWei('4', 'Wei')
            couponPayment = new web3.utils.BN(couponPayment)
    
            const expectedBalance1 = oldBalance1.add(couponPayment)
            assert.equal(newBalance1.toString(), expectedBalance1.toString())

            couponPayment = web3.utils.toWei('16', 'Wei')
            couponPayment = new web3.utils.BN(couponPayment)
            
            const expectedBalance2 = oldBalance2.add(couponPayment)
            assert.equal(newBalance2.toString(), expectedBalance2.toString()) 
            //await timeMachine.advanceTimeAndBlock(duration.days(2)); // + 2 days   
        })
        it('checkin coupon payment made on time', async function() {
            // Coupon out of range
            await bond.couponPaymentMadeOnTime(6).should.be.rejected
            // Coupon not matured yet
            await bond.couponPaymentMadeOnTime(1).should.be.rejected

            // Advance time to after first coupon
            await timeMachine.advanceTimeAndBlock(duration.days(200)) // + 200 days
            let result = await bond.couponPaymentMadeOnTime(1)
            assert.isTrue(result)
            

            // Advance time to after first coupon
            await timeMachine.advanceTimeAndBlock(duration.days(200)); // + 200 days
            // Second coupon
            await bond.payCoupons({from: company, value: web3.utils.toWei('20', 'Wei')}) 
            result = await bond.couponPaymentMadeOnTime(2);
            assert.isFalse(result);  
        })
        it('Borrowing company can not make extra coupon payments', async function() {   
            // Third coupon
            await bond.payCoupons({from: company, value: web3.utils.toWei('20', 'Wei')})
            // Fourth and final coupon
            await bond.payCoupons({from: company, value: web3.utils.toWei('20', 'Wei')})
            // This should be rejected
            await bond.payCoupons({from: company, value: web3.utils.toWei('20', 'Wei')}).should.be.rejected
        })

        it('Tokens and principal transferred at maturity', async function() {
            // Record investors' balances before the principal payback
            let oldBalance1 = await web3.eth.getBalance(investor)
            oldBalance1 = new web3.utils.BN(oldBalance1)
    
            let oldBalance2 = await web3.eth.getBalance(investor2)
            oldBalance2 = new web3.utils.BN(oldBalance2)
            
     
            // Paying back bond
            // If not enough money, rejected
            await bond.payBackBond({from: company, value: web3.utils.toWei('100', 'Wei')}).should.be.rejected
            //  Not from the borrowing company
            await bond.payBackBond({from: owner, value: web3.utils.toWei('1000', 'Wei')}).should.be.rejected
            
            //let debt = await bond.getTotalDebt()
            //console.log(debt.toNumber())
            let result = await bond.payBackBond({from: company, value: web3.utils.toWei('1500', 'Wei')})
                 
            // First two events are approval and transfer
            const transfer1 = result.logs[1].args; 
            
            // First events for investor 2
            const transfer3 = result.logs[5].args;
            
            // Last event is refund
            const refund = result.logs[20].args;
            
            
            // Check that tokens are returned to the owner of the contract

            assert.equal(transfer1.tokenId, 0)
            let ownerOfToken = await bond.ownerOf(0)
            assert.equal(ownerOfToken, owner)

            assert.equal(transfer3.tokenId, 2)
            ownerOfToken = await bond.ownerOf(2)
            assert.equal(ownerOfToken, owner)

    
            // Check refund event
            assert.equal(refund.account, company)
            assert.equal(refund.value.toString(), 500)
      
            
            // Check investor's balance after
            let newBalance1 = await web3.eth.getBalance(investor)
            newBalance1 = new web3.utils.BN(newBalance1)
    
            let principalPayment = web3.utils.toWei('200', 'Wei')
            principalPayment = new web3.utils.BN(principalPayment)
    
            let expectedBalance = oldBalance1.add(principalPayment)
            assert.equal(newBalance1.toString(), expectedBalance.toString())

            
            let newBalance2 = await web3.eth.getBalance(investor2)
            newBalance2 = new web3.utils.BN(newBalance2)

            principalPayment = web3.utils.toWei('800', 'Wei')
            principalPayment = new web3.utils.BN(principalPayment)
    
            expectedBalance = oldBalance2.add(principalPayment)
            assert.equal(newBalance2.toString(), expectedBalance.toString())    
        })
        it('the bond count is 0 after all tokens returned to owner', async function() {
            let count = await bond.bondCount()
            assert.equal(count.toNumber(), 0)
        })
        
        it('check bond payback time correctly', async function () {
            // When not matured yet
            await bond.principalPaymentMadeOnTime().should.be.rejected
            await timeMachine.advanceTimeAndBlock(duration.years(1)); // + 1 year
            let result = await bond.principalPaymentMadeOnTime()
            assert.isTrue(result)
        })
        
        

        /*
        
        it('issuing tokens is not possible if contract is paused by regulator', async function() {
            let result = await bond.pause({from: regulator})
            const paused = result.logs[0].args
            assert.equal(paused.account, regulator) 

            await bond.issueTokens({from: owner}).should.be.rejected
            await bond.unpause({from: regulator})
        })
        
        
        it('Issuing bonds is possible after investment window is closed', async function() {
            // Track balance of the company before the token issuance
            let oldBalance = await web3.eth.getBalance(company)
            oldBalance = new web3.utils.BN(oldBalance) 
    
            // Store the result and get the transfer event
            let result = await bond.issueBonds({from: owner})
            const transfer1 = result.logs[0].args;
            const transfer2 = result.logs[1].args;
            const transfer3 = result.logs[2].args;
            const transfer4 = result.logs[3].args;
    
            
            // Has the right token id
            assert.equal(transfer1.tokenId, 0)
            assert.equal(transfer2.tokenId, 1)
            assert.equal(transfer3.tokenId, 2)
            assert.equal(transfer4.tokenId, 3)
    
            
            // Has the right token owner
            assert.equal(transfer1.to, investor)
            assert.equal(transfer2.to, investor)
            assert.equal(transfer3.to, investor)
            assert.equal(transfer4.to, investor2)
    
            
            // Check new balance of the company after the token issue
            let newBalance = await web3.eth.getBalance(company)
            newBalance = new web3.utils.BN(newBalance)
    
            let paidAmount = web3.utils.toWei('4000', 'Wei')
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

        
        it('Extra investment amount is returned to the investor', async function() {    
            // Check investors balance after the investment
            let newBalance = await web3.eth.getBalance(investor2)
            newBalance = new web3.utils.BN(newBalance)
    
            // Expected differenece on the balance
            let difference = web3.utils.toWei('500', 'Wei')
            difference = new web3.utils.BN(difference)
    
            let expectedBalance = balanceAfterInvestment.add(difference)
            assert.equal(newBalance.toString(), expectedBalance.toString())
        })

        
        it('The token count is correct after issuing tokens', async function() {
            let count = await bond.bondCount()
            assert.equal(count.toNumber(), 4)
        })

        it('Investors get coupons', async function() {
            // Record investor's balance before the coupon payment
            let oldBalance1 = await web3.eth.getBalance(investor)
            oldBalance1 = new web3.utils.BN(oldBalance1)
    
            let oldBalance2 = await web3.eth.getBalance(investor2)
            oldBalance2 = new web3.utils.BN(oldBalance2)

            // Pay coupons
            let result = await bond.payCoupons({from: company, value: web3.utils.toWei('4', 'Wei')})
            const coupon1 = result.logs[0].args;
            const coupon2 = result.logs[1].args;
            const coupon3 = result.logs[2].args;
            const coupon4 = result.logs[3].args;
    
            // Check event details
            assert.equal(coupon1.investor, investor)
            assert.equal(coupon1.bondId, 0)
            
            assert.equal(coupon2.investor, investor)
            assert.equal(coupon2.bondId, 1)

            assert.equal(coupon3.investor, investor)
            assert.equal(coupon3.bondId, 2)

            assert.equal(coupon4.investor, investor2)
            assert.equal(coupon4.bondId, 3)

            // Check new balance of the investor after the coupon payment
            let newBalance1 = await web3.eth.getBalance(investor)
            newBalance1 = new web3.utils.BN(newBalance1)
    
            let newBalance2 = await web3.eth.getBalance(investor2)
            newBalance2 = new web3.utils.BN(newBalance2)
    
            // Mock the paid amount
            let couponPayment = web3.utils.toWei('3', 'Wei')
            couponPayment = new web3.utils.BN(couponPayment)
    
            const expectedBalance1 = oldBalance1.add(couponPayment)
            assert.equal(newBalance1.toString(), expectedBalance1.toString())

            couponPayment = web3.utils.toWei('1', 'Wei')
            couponPayment = new web3.utils.BN(couponPayment)
            
            const expectedBalance2 = oldBalance2.add(couponPayment)
            assert.equal(newBalance2.toString(), expectedBalance2.toString())
        })

        it('Payment check returns true, when coupons paid on time', async function() {
            // Advance time to after the first coupon payment was die
            await timeMachine.advanceTimeAndBlock(duration.years(0.5)); // +6 mth & 1 week
            let result = await bond.couponPaymentsMadeOnTime()
            assert.isTrue(result)
        })
        it('Payment check returns false, when coupons not paid on time', async function() {
            // Advance time to after the first coupon payment was die
            await timeMachine.advanceTimeAndBlock(duration.years(0.5)); // +1 year & 1 week
            let result = await bond.couponPaymentsMadeOnTime()
            assert.isFalse(result)
        })
        it('Borrowing company can not make extra coupon payments', async function() {
            // Second coupon
            await bond.payCoupons({from: company, value: web3.utils.toWei('4', 'Wei')}) 
            // Third coupon
            await bond.payCoupons({from: company, value: web3.utils.toWei('4', 'Wei')})
            // Fourth and final coupon
            await bond.payCoupons({from: company, value: web3.utils.toWei('4', 'Wei')})
            // This should be rejected
            await bond.payCoupons({from: company, value: web3.utils.toWei('4', 'Wei')}).should.be.rejected
        })
        
        it('Tokens and principal transferred at maturity', async function() {
            // Record investors' balances before the principal payback
            let oldBalance1 = await web3.eth.getBalance(investor)
            oldBalance1 = new web3.utils.BN(oldBalance1)
    
            let oldBalance2 = await web3.eth.getBalance(investor2)
            oldBalance2 = new web3.utils.BN(oldBalance2)
     
            // Paying back bond
            let result = await bond.payBackBond({from: company, value: web3.utils.toWei('4500', 'Wei')})
            
            
            // First event is approval
            const transfer1 = result.logs[1].args; 
            // Next event is approval
            const transfer2 = result.logs[3].args;
            // Next event is approval
            const transfer3 = result.logs[5].args;
            // Next event is approval
            const transfer4 = result.logs[7].args;
            const refund = result.logs[8].args;
            
            
            // Check that tokens are returned to the owner

            assert.equal(transfer1.tokenId, 0)
            let ownerOfToken = await bond.ownerOf(0)
            assert.equal(ownerOfToken, owner)
    
            
            assert.equal(transfer2.tokenId, 1)
            ownerOfToken = await bond.ownerOf(1)
            assert.equal(ownerOfToken, owner)

            assert.equal(transfer3.tokenId, 2)
            ownerOfToken = await bond.ownerOf(2)
            assert.equal(ownerOfToken, owner)

            assert.equal(transfer4.tokenId, 3)
            ownerOfToken = await bond.ownerOf(3)
            assert.equal(ownerOfToken, owner)
    
            // Check refund event
            assert.equal(refund.sender, company)
            assert.equal(refund.value.toString(), 500)
      
    
            // Check investor's balance after
            let newBalance1 = await web3.eth.getBalance(investor)
            newBalance1 = new web3.utils.BN(newBalance1)
            let newBalance2 = await web3.eth.getBalance(investor2)
            newBalance2 = new web3.utils.BN(newBalance2)
    
            let principalPayment = web3.utils.toWei('3000', 'Wei')
            principalPayment = new web3.utils.BN(principalPayment)
    
            let expectedBalance = oldBalance1.add(principalPayment)
            assert.equal(newBalance1.toString(), expectedBalance.toString())

            principalPayment = web3.utils.toWei('1000', 'Wei')
            principalPayment = new web3.utils.BN(principalPayment)
    
            expectedBalance = oldBalance2.add(principalPayment)
            assert.equal(newBalance2.toString(), expectedBalance.toString())  
            
        })
        
        it('the bond count is 0 after all tokens returned to owner', async function() {
            let count = await bond.bondCount()
            assert.equal(count.toNumber(), 0)
        })
        
        it('can not call principal payment check before maturity date', async function() {
            await bond.principalPaymentMadeOnTime().should.be.rejected
        })
        it('if principal is paid on time, check returns true', async function() {
            await timeMachine.advanceTimeAndBlock(duration.years(1)); // +2 year & 1 week
            let result = await bond.principalPaymentMadeOnTime()
            assert.isTrue(result)
        })
    })
    


    /*

    it('bidding not possible after bidding time is closed', async function() {
        // Advance time
        await timeMachine.advanceTimeAndBlock(duration.weeks(1));
        await bond.registerInvestment(1, {from: investor, value: web3.utils.toWei('1000', 'Wei')}).should.be.rejected

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
        assert.equal(event.numberOfTokens, 1)
         
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
        assert.equal(event.numberOfTokens, 2)

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
        //assert.equal(transfer3.tokenId, 2)

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
        await bond.registerInvestment(1, {from: investor2, value: web3.utils.toWei('1000', 'Wei')})
        
        // Issue tokens
        await bond.issueTokens({from: owner})

        // Record investors' balances before the principal payback
        let oldBalance1 = await web3.eth.getBalance(investor)
        oldBalance1 = new web3.utils.BN(oldBalance1)

        let oldBalance2 = await web3.eth.getBalance(investor2)
        oldBalance2 = new web3.utils.BN(oldBalance2)
 
        // Paying back bond
        let result = await bond.payBackBond({from: company, value: web3.utils.toWei('3000', 'Wei')})
        // First event is approval
        const transfer1 = result.logs[1].args;
        // Next event is approval
        const transfer2 = result.logs[3].args;
        const refund = result.logs[4].args;
        
        // Check transfer and the right owner of the token 
        assert.equal(transfer1.tokenId, 0)
        let ownerOfToken = await bond.ownerOf(0)
        assert.equal(ownerOfToken, owner)

        assert.equal(transfer2.tokenId, 1)
        ownerOfToken = await bond.ownerOf(1)
        assert.equal(ownerOfToken, owner)

        // Check refund event
        assert.equal(refund.sender, company)
        assert.equal(refund.value.toString(), 1000)
  

        // Check investor's balance after
        let newBalance1 = await web3.eth.getBalance(investor)
        newBalance1 = new web3.utils.BN(newBalance1)
        let newBalance2 = await web3.eth.getBalance(investor2)
        newBalance2 = new web3.utils.BN(newBalance2)

        let principalPayment = web3.utils.toWei('1000', 'Wei')
        principalPayment = new web3.utils.BN(principalPayment)

        let expectedBalance = oldBalance1.add(principalPayment)
        assert.equal(newBalance1.toString(), expectedBalance.toString())

        expectedBalance = oldBalance2.add(principalPayment)
        assert.equal(newBalance2.toString(), expectedBalance.toString())
        
    })

    it('Only regulator can pause and unpause the bond', async function () {
        // Failure
        await bond.pause().should.be.rejected;
        await bond.unpause().should.be.rejected;
        
        // SUCCESS
        // Pause the bond
        let result = await bond.pause({from: regulator})
        const paused = result.logs[0].args
        assert.equal(paused.account, regulator) 

        // Pause the bond
        result = await bond.unpause({from: regulator})
        const unpaused = result.logs[0].args
        assert.equal(unpaused.account, regulator) 
    })
    
    it('Green Verifier can adjust the coupon', async function() {
        // FAILURE
        // Only green verifier can adjust the coupons
        await bond.adjustCoupon(true, 1).should.be.rejected
        // Can't make coupon payment negative
        await bond.adjustCoupon(false, 2, {from: greenVerifier}).should.be.rejected

        // SUCCESS
        let result = await bond.adjustCoupon(true, 1, {from: greenVerifier})
        const couponIncrease = result.logs[0].args
        assert.equal(couponIncrease.adjuster, greenVerifier)
        assert.equal(couponIncrease.couponRate, 2)

        result = await bond.adjustCoupon(false, 2, {from: greenVerifier})
        const couponDecrese = result.logs[0].args
        assert.equal(couponDecrese.adjuster, greenVerifier)
        assert.equal(couponDecrese.couponRate, 0)
        */
    })
    

})