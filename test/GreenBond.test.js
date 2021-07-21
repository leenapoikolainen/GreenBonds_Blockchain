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
        it('adjusting coupon works', async function() {
            let coupon = await bond.getCoupon()
            assert.equal(coupon, 2)

            let result = await bond.adjustCoupon(true, 1)
            let event = result.logs[0].args
            assert.equal(event.from, 2)
            assert.equal(event.to, 3)
            coupon = await bond.getCoupon()
            assert.equal(coupon, 3)

            result = await bond.adjustCoupon(false, 2)
            event = result.logs[0].args
            assert.equal(event.from, 3)
            assert.equal(event.to, 1)
            coupon = await bond.getCoupon()
            assert.equal(coupon, 1)

            // Coupon can't be negative
            await bond.adjustCoupon(false, 2).should.be.rejected
        })
    })
    
})

        /*
        

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
 