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

const GreenVerification = artifacts.require('GreenVerification');

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('GreenVerification', function (accounts) {
    let verification;
    let votingClosingTime = Math.floor(new Date().getTime() / 1000) + duration.days(2)
    const verifier = accounts[4];
    const company = accounts[5];
    const project = "Green Project";
   
    const investor = accounts[1];
    const investor2 = accounts[2];
    const investor3 = accounts[3];
    const investor4 = accounts[6];
    

    // Changed from beforeEach to before
    beforeEach(async function() {
        verification = await GreenVerification.new(company, project, votingClosingTime, {from: verifier});  
    });

    it('deploys successfully', async function() {
        const address = await verification.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    }) 

    it('has the right details', async function() {
        let role = await verification.getCompany()
        assert.equal(role, company)

        role = await verification.getGreenVerifier() 
        assert.equal(role, verifier)

        let time = await verification.getVotingClosingTime()
        assert.equal(time, votingClosingTime)
    })

    it('verifier can vote', async function() {
        await verification.greenVerifierVote(0, {from: investor}).should.be.rejected
        let result = await verification.greenVerifierVote(0, {from: verifier})
        const event = result.logs[0].args;

        assert.equal(event.voter, verifier);
        assert.equal(event.vote.toNumber(), 0);
    })

    it('investors can vote between range', async function() {
        // Out of range, should be rejected
        await verification.vote(3, {from: investor}).should.be.rejected

        // first vote for investor 1
        let result = await verification.vote(0, {from: investor})
        let event = result.logs[0].args;

        assert.equal(event.voter, investor);
        assert.equal(event.vote.toNumber(), 0);

        result = await verification.vote(1, {from: investor2})
        event = result.logs[0].args;

        assert.equal(event.voter, investor2);
        assert.equal(event.vote.toNumber(), 1);

        let votesAtBelow = await verification.getInvestorVotesPerVote(0);
        assert.equal(votesAtBelow, 1);
        let votesAtPar = await verification.getInvestorVotesPerVote(1);
        assert.equal(votesAtPar, 1);
        let votesAtAbove = await verification.getInvestorVotesPerVote(2);
        assert.equal(votesAtAbove, 0)
    })
    it('investors can only vote once', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(1, {from: investor}).should.be.rejected
    })
    it('gets verified when at least 50% of votes are the same as the verifiers vote', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(0, {from: investor2})
        await verification.vote(1, {from: investor3})

        await verification.greenVerifierVote(0, {from: verifier})

        let verified = await verification.isVerified()
        assert.isFalse(verified)

        await verification.verify({from: verifier})
        verified = await verification.isVerified()
        assert.isTrue(verified)
    })
    it('is not verified, if less than 50 percent dont support', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(0, {from: investor2})
        await verification.vote(1, {from: investor3})

        await verification.greenVerifierVote(1, {from: verifier})

        let verified = await verification.isVerified()
        assert.isFalse(verified)

        await verification.verify({from: verifier})
        verified = await verification.isVerified()
        assert.isFalse(verified)
    })
    it('can reset the votes', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(0, {from: investor2})
        await verification.vote(1, {from: investor3})

        assert.equal(await verification.getVoterCount(), 3)
        await verification.greenVerifierVote(1, {from: verifier})
        assert.equal(await verification.getVerifierVote(), 1)
    
        let result = await verification.reset("test", {from: verifier})
        let event = result.logs[0].args;

        assert.equal(event.reason, "test");
        // Number of voters is zero
        assert.equal(await verification.getVoterCount(), 0)
        // Verifier vote is undefined
        assert.equal(await verification.getVerifierVote(), 3)
    })
    it('highest number of votes calculated correctly', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(0, {from: investor2})
        await verification.vote(1, {from: investor3})

        let result = await verification.getHighestVotedOption()
        assert.equal(result,0)
    })

    it('voters choice wins if the option gets more than 50% of the votes', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(0, {from: investor2})
        await verification.vote(1, {from: investor3})

        await verification.greenVerifierVote(1, {from: verifier})

        await verification.verify2({from: verifier})
        assert.equal(await verification.getFinalVote(), 0)
    })

    it('verifiers choice wins if voters option gets less than or equal to 50% of the votes', async function() {
        await verification.vote(0, {from: investor})
        await verification.vote(0, {from: investor2})
        await verification.vote(1, {from: investor3})
        await verification.vote(1, {from: investor4})

        await verification.greenVerifierVote(2, {from: verifier})

        await verification.verify2({from: verifier})
        assert.equal(await verification.getFinalVote(), 2)
    })
})