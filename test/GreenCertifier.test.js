const { expect, assert } = require('chai');
const { default: Web3 } = require('web3')

const GreenCertifier = artifacts.require('GreenCertifier');

require('chai')
  .use(require('chai-as-promised'))
  .should()

  contract('GreenCertifier' ,function (accounts) {
    let certifierContract;
    const greenCertifier = accounts[0];
    const company = accounts[1];

    beforeEach(async function() {
        certifierContract = await GreenCertifier.new({from: greenCertifier});
    });

    it('deploys successfully', async function() {
        const address = await certifierContract.address
        assert.notEqual(address, 0x0)
        assert.notEqual(address,"")
        assert.notEqual(address, null)
        assert.notEqual(address, undefined)
    })
    it('has the right details', async function() {
        let owner = await certifierContract.getOwner()
        assert.equal(owner, greenCertifier)
    })
    it('can create new certificate', async function() {
        // No certification exists for the company in the beginning
        let certificationExists = await certifierContract.isCertifiedCompany(company)
        assert.isFalse(certificationExists)

        // Only owner can create certificates
        await certifierContract.createCertificate(company, "Project A", {from: company}).should.be.rejected

        let result = await certifierContract.createCertificate(company, "Project A", {from: greenCertifier})
        
        // Certificate exists
        certificationExists = await certifierContract.isCertifiedCompany(company)
        assert.isTrue(certificationExists)

        // Get certificate
        
        // If no certificate exits, query rejected
        await certifierContract.getCompanyCertificateAddress(greenCertifier).should.be.rejected
        
        let certificate = await certifierContract.getCompanyCertificateAddress(company)

        let event = result.logs[0].args;
        assert.equal(event.certificate, certificate)

        event = result.logs[1].args
        assert.equal(event.company, company)
        assert.equal(event.project, "Project A")

        // Check the list of projects is correct

        // If no certificate exits, query rejected
        await certifierContract.getCertifiedProjects(greenCertifier).should.be.rejected
        
        let list = await certifierContract.getCertifiedProjects(company)
        assert.equal(list[0], "Project A")

    })  
    it('does not create a new company level certificate when one already exists', async function() {
        await certifierContract.createCertificate(company, "Project A", {from: greenCertifier})
        let result = await certifierContract.createCertificate(company, "Project B", {from: greenCertifier})
        let event = result.logs[0].args
        assert.equal(event.company, company)
        assert.equal(event.project, "Project B")
        //console.log(await certifierContract.getCertifiedProjects(company))
    })  
    it('can query if a specific project is certified', async function() {
        // Requires to have certificate
        await certifierContract.isCeritifiedProject(greenCertifier, "Project A").should.be.rejected
        
        await certifierContract.createCertificate(company, "Project A", {from: greenCertifier})
        let isCertified = await certifierContract.isCeritifiedProject(company, "Project B")
        assert.isFalse(isCertified)
       
        await certifierContract.createCertificate(company, "Project B", {from: greenCertifier})
        isCertified = await certifierContract.isCeritifiedProject(company, "Project B")
        assert.isTrue(isCertified)
    }) 
    

})