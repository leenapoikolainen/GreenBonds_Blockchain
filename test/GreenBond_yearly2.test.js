const { assert } = require('chai')
const timeMachine = require('ganache-time-traveler')

const duration = {
    seconds: function (val) { return val; },
    minutes: function (val) { return val * this.seconds(60); },
    hours: function (val) { return val * this.minutes(60); },
    days: function (val) { return val * this.hours(24); },
    weeks: function (val) { return val * this.days(7); },
    years: function (val) { return val * this.days(365); },
}

const GreenBond = artifacts.require('GreenBond_yearly');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('GreenBond_yearly - Cancellation scenario', function (accounts) {
    let bond;
    let bondName = "Green Bond";
    let bondSymbol = "GREEN";
    let baseURI = "https://storage.cloud.google.com/metadata_platform/";
    let numberOfBondsSeeked = 10;
    let minCoupon = 2;
    let maxCoupon = 5;
    let bidClosingTime = Math.floor(new Date().getTime() / 1000) + duration.days(2)
    let term = 10;


    let couponsPerTerm = 1 // daily
    const owner = accounts[0];
    const company = accounts[8];

    // Changed from beforeEach to before
    before(async function () {
        bond = await GreenBond.new(company, bondName, bondSymbol, numberOfBondsSeeked, minCoupon, maxCoupon,
            bidClosingTime, term, couponsPerTerm, baseURI, { from: owner});          
    });

    describe('Deployment', () => {
        it('min coupon cannot be higher than max coupon', async() => {
            await GreenBond.new(company, bondName, bondSymbol, numberOfBondsSeeked, 5, 1,
                bidClosingTime, term, couponsPerTerm, baseURI, { from: owner}).should.be.rejected
        })
        it('bid closing time cannot be in the past', async() => {
            await GreenBond.new(company, bondName, bondSymbol, numberOfBondsSeeked, minCoupon, maxCoupon,
                1627209657, term, couponsPerTerm, baseURI, { from: owner}).should.be.rejected
        })
        it('company address cannot be zero', async() => {
            await GreenBond.new('0x0', bondName, bondSymbol, numberOfBondsSeeked, minCoupon, maxCoupon,
                bidClosingTime, term, couponsPerTerm, baseURI, { from: owner}).should.be.rejected
        })

        it('Prints coupon date correctly', async function() {
            let list = await bond.getCouponDates()
            console.log(list[0].toNumber())
        })

    })
  
    describe('After bidding time is over', () => {
       
        before(async () => {            
            // Advance time
            await timeMachine.advanceTimeAndBlock(duration.days(2)); // + 2 days
        })
        
        it('coupon is 0 and issue is cancelled', async function() {
            let result = await bond.defineCoupon({from: owner})
            let cancel = result.logs[0].args

            assert.equal(cancel.actualDemand, 0)
            assert.equal(cancel.requestedDemand, 10)

            const _coupon = await bond.getCoupon()
            assert.equal(_coupon.toNumber(), 0)

            const cancelled = await bond.cancelled()
            assert.isTrue(cancelled)

        })
        it('can not issue bonds, when issue has been cancelled', async function() {
            await bond.issueBonds({from: owner}).should.be.rejected
        })

    })  
    
})
