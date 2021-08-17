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

const GreenBond3 = artifacts.require('GreenBond3');

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('GreenBond3_2', function (accounts) {
    let bond;
    let bondName = "Green Bond";
    let bondSymbol = "GREEN";
    let baseURI = "https://storage.cloud.google.com/metadata_platform/";
    let numberOfBondsSeeked = 10;
    let minCoupon = 1;
    let maxCoupon = 5;
    let bidClosingTime = Math.floor(new Date().getTime() / 1000) + duration.days(2)
    let term = 10;


    let couponsPerTerm = 1 // daily
    const owner = accounts[0];
    const investor = accounts[1];
    const investor2 = accounts[2];
    const investor3 = accounts[3];
    const regulator = accounts[4];
    const company = accounts[8];

    // Changed from beforeEach to before
    before(async function () {
        bond = await GreenBond3.new(company, bondName, bondSymbol, numberOfBondsSeeked, minCoupon, maxCoupon,
            bidClosingTime, term, couponsPerTerm, baseURI, { from: owner});
            
    });

    
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

        

  
 