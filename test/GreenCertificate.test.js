const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')

const GreenCertificate = artifacts.require('GreenCertificate');

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('GreenCertificate' ,function (accounts) {
    let certificate;
    const greenVerifier = accounts[0];
    const company = accounts[1];

    beforeEach(async function() {
        certificate = await GreenCertificate.new(company, {from: greenVerifier});
    });

    it('deploys successfully', async function() {
        const address = await certificate.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it('has the right company ', async function () {
        const certifiedCompany = await certificate.getCompany()
        assert.equal(certifiedCompany, company)
    })
    it('can add and remove projects', async function () {
        let result = await certificate.addProject("Project A")
        const event1 = result.logs[0].args
        assert.equal(event1.name.toString(), "Project A")
        
        let date = new Date(event1.timestamp.toNumber() * 1000)
        console.log(date)
        /*
        console.log(date.getHours())
        console.log(date.getMinutes())
        console.log(date.getSeconds())
        */

        // Check project 
        let isCertified = await certificate.isCertifiedProject("Project A")
        assert.isTrue(isCertified)
        
        // Remove certificate
        result = await certificate.removeProject("Project A")
        const event2 = result.logs[0].args
        assert.equal(event2.name.toString(), "Project A")

        isCertified = await certificate.isCertifiedProject("Project A")
        assert.isFalse(isCertified)
    })

    
    it('can set deadline', async function() {
        await certificate.setDeadline(1628236762)
        let endDate = await certificate.getEndDate()
        assert.equal(endDate, 1628236762)
    })
})