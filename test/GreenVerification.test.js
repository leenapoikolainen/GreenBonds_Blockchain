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
    

    // Changed from beforeEach to before
    beforeEach(async function() {
        verification = await GreenVerification.new(verifier, company, project, votingClosingTime);  
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
})