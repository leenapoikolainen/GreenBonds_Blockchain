const { expect, assert } = require('chai');
const { default: Web3 } = require('web3');
const timeMachine = require('ganache-time-traveler');

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
}

const BondPriceAuction = artifacts.require('BondPriceAuction');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('BondPriceAuction', function (accounts) {
    let auction;
    const owner = accounts[0];
    const company = accounts[1];
    const investor = accounts[2];
    const investor2 = accounts[3];
    let deadline = Math.floor(new Date().getTime() / 1000) + duration.weeks(2)

    it('closing time can not be in the past', async function() {
        await BondPriceAuction.new('Green project', company, 1, 5, 10, 1620293544).should.be.rejected
    })

    beforeEach(async function () {
        auction = await BondPriceAuction.new('Green project', company, 1, 5, 10, deadline);
    })

    it('registers bids correctly', async function() {
        await auction.registerBid2(2, 3, {from: investor, value: web3.utils.toWei('300', 'Wei')})
        //let list = await auction.getInvestorsAtCoupon(2)
        //console.log(list)
        let amount = await auction.getInvestorsInterestAtCouponLevel(investor, 2)
        assert.equal(amount.toNumber(), 3)
        
        amount = await auction.getInvestorsInterestAtCouponLevel(investor, 1)
        assert.equal(amount.toNumber(), 0)

        let balance = await auction.getAmountInvesterPerInvestor(investor);
        assert.equal(balance.toNumber(), 300)
    })

    it('coupon is defined correctly', async function() {
        await auction.registerBid2(5, 3, {from: investor, value: web3.utils.toWei('300', 'Wei')})
        await auction.registerBid2(4, 7, {from: investor2, value: web3.utils.toWei('700', 'Wei')})
        

        let demand = await auction.getDemandAtCouponLevel(5)
        assert.equal(demand.toNumber(),3)
        demand = await auction.getDemandAtCouponLevel(4)
        assert.equal(demand.toNumber(),7)

        // 0 by default
        let coupon = await auction.getCoupon()
        assert.equal(coupon, 0)


        // Only owner can define coupon
        await auction.defineCoupon2({from: investor}).should.be.rejected

        let result = await auction.defineCoupon2({from: owner}) 
        let event = result.logs[0].args
        assert.equal(event.coupon, 4)
        
        coupon = await auction.getCoupon()
        assert.equal(coupon, 4)
    })

    it('testing the issuing function', async function() {
        await auction.registerBid2(5, 3, {from: investor, value: web3.utils.toWei('300', 'Wei')})
        await auction.registerBid2(4, 7, {from: investor2, value: web3.utils.toWei('700', 'Wei')})
        await auction.registerBid2(3, 2, {from: investor2, value: web3.utils.toWei('200', 'Wei')})
        
        let result = await auction.defineCoupon2({from: owner}) 
        coupon = await auction.getCoupon()
        assert.equal(coupon, 4)

        result = await auction.issueTokens()
        
        let issue1 = result.logs[0].args
        let issue2 = result.logs[1].args
        let refund = result.logs[2].args

        assert.equal(issue1.investor, investor)
        assert.equal(issue1.amount, 3)  
        
        assert.equal(issue2.investor, investor2)
        assert.equal(issue2.amount, 7)  

        
        assert.equal(refund.investor, investor2)
        assert.equal(refund.amount, 200)
        
    })

    /*
    it('deploys successfully', async function () {
        const address = await auction.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address, "")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it('has the right details', async function () {
        const name = await auction.getProject()
        assert.equal(name, 'Green project')
        const firm = await auction.getCompany()
        assert.equal(firm, company)
        const min = await auction.getMinCoupon()
        assert.equal(min, 1)
        const max = await auction.getMaxCoupon()
        assert.equal(max, 5)
        const tokensWanted = await auction.getSeekedNumberOfBonds()
        assert.equal(tokensWanted, 10)
        const closingTime = await auction.getBidClosingTime();
        assert.equal(closingTime, deadline)
        //const date = new Date(closingTime*1000)
        //console.log(date)
    })
    it('Investors can register bid', async function() {
        // Can't bid for lower than the min coupon or higher than the max bid
        await auction.registerBid(0, 2, {from: investor}).should.be.rejected
        await auction.registerBid(6, 2, {from: investor}).should.be.rejected
        
        let result = await auction.registerBid(5, 2, {from: investor})
        let bid = result.logs[0].args

        assert.equal(bid.bidder, investor)
        assert.equal(bid.coupon, 5)
        assert.equal(bid.amount, 2)

        let demand = await auction.getDemandAtCouponLevel(5)
        assert.equal(demand.toNumber(),2)
    })
    it('coupon is defined correctly', async function() {
        await auction.registerBid(5, 5, {from: investor})
        await auction.registerBid(4, 5, {from: investor})

        let demand = await auction.getDemandAtCouponLevel(5)
        assert.equal(demand.toNumber(),5)
        demand = await auction.getDemandAtCouponLevel(4)
        assert.equal(demand.toNumber(),5)

        // 0 by default
        let coupon = await auction.getCoupon()
        assert.equal(coupon, 0)

        // Advance time
        await timeMachine.advanceTimeAndBlock(duration.weeks(3));

        // Only owner can define coupon
        await auction.defineCoupon({from: investor}).should.be.rejected

        let result = await auction.defineCoupon({from: owner}) 
        let event = result.logs[0].args
        assert.equal(event.coupon, 4)
        
        coupon = await auction.getCoupon()
        assert.equal(coupon, 4)
    })
    */
    
    // Works only without the time machine
    /*
    it('coupon will be 0, if not enough demand', async function() {
        await auction.registerBid(5, 5, {from: investor})
        await auction.registerBid(3, 3, {from: investor})

        let result = await auction.defineCoupon() 
        let event = result.logs[0].args
        assert.equal(event.totalDemand, 8)
        
        let coupon = await auction.getCoupon()
        assert.equal(coupon, 0)
        
    })
    */
})
