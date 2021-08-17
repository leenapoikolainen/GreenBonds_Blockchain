const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')

const GreenCertificate = artifacts.require('GreenCertificate');

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('GreenCertificate' ,function (accounts) {
    let certificate;
    const greenCertifier = accounts[0];
    const company = accounts[1];

    beforeEach(async function() {
        certificate = await GreenCertificate.new(company, {from: greenCertifier});
    });

    it('deploys successfully', async function() {
        const address = await certificate.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it('has the right company and owner', async function () {
        const certifiedCompany = await certificate.getCompany()
        assert.equal(certifiedCompany, company)
        const owner = await certificate.getOwner()
        assert.equal(owner, greenCertifier)
    })
    it('can add projects', async function () {
        // Only owner can create certificates
        await certificate.addProject("Project A", {from: company}).should.be.rejected
        
        let result = await certificate.addProject("Project A", {from: greenCertifier})
        const event1 = result.logs[0].args
        assert.equal(event1.name.toString(), "Project A")

        // Check that project is certified 
        let isCertified = await certificate.isCertifiedProject("Project A")
        assert.isTrue(isCertified)

    })

})