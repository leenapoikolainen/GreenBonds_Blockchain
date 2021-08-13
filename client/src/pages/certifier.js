import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts

import GreenCertifier from '../contracts/GreenCertifier.json'


class Certifier extends Component {

    async componentWillMount() {
        await this.loadBlockchainData()  
        await this.loadWeb3()     
    }

    async loadWeb3() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum)
		}
		else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider)
		}
		else {
			window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
		}
	}
    async loadBlockchainData() {
        const web3 = new Web3(window.web3.currentProvider)

        // Load account
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })

        // Network connection
        const networkId = await web3.eth.net.getId()
        const networkData = GreenCertifier.networks[networkId]

        if (networkData) {
            const greenCertifier = new web3.eth.Contract(GreenCertifier.abi, networkData.address)

            this.setState({ greenCertifier })

            const certifier = await greenCertifier.methods.getOwner().call()
            this.setState({ certifier })

        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }



    timeConverter(UNIX_timestamp) {
        var dateObject = new Date(UNIX_timestamp * 1000);
        return dateObject.toLocaleString()
    }

    createCertificate = (companyAddress, project) => {
        this.state.greenCertifier.methods.createCertificate(companyAddress, project).send({ from: this.state.account })

    }

    isCertified = async (company) => {
        const certificateExists = await this.state.greenCertifier.methods.isCertifiedCompany(company).call()
        let certificateStatus

        if (certificateExists) {
            certificateStatus = "Certificate exists"
        } else {
            certificateStatus = "Certificate does not exist"
        }
        this.setState({ certificateStatus })
    }

    getCertificate = async (company) => {
        const certificateAddress = await this.state.greenCertifier.methods.getCompanyCertificateAddress(company).call()
        this.setState({ certificateAddress })
    }

    getProjects = async (company) => {
        const projects = await this.state.greenCertifier.methods.getCertifiedProjects(company).call()

        const projectList = projects.map((project) =>
            <li>{project}</li>
        );
        this.setState({ projectList })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            greenBond: null,
            greenCertifier: null,
            certificateStatus: '',
            certificateAddress: '',

        }
    }


    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    <div className="alert alert-secondary text-center" role="alert">
                        <p>Certificate Issuer: {this.state.certifier}</p>
                    </div>
                   
                    
                </div>

                <div className="container mr-auto ml-auto mb-5">
                    <h2>Create certificate</h2>

                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const compAdd = this.compAdd.value
                        const project = this.project.value
                        this.createCertificate(compAdd, project)
                    }}>
                        <label for="compAdd">Company Address</label>
                        <input
                            id='compAdd'
                            type='text'
                            className='form-control mb-1'
                            required
                            ref={(input) => { this.compAdd = input }}
                        />
                        <label for="project">Project Name</label>
                        <input
                            id='project'
                            type='text'
                            className='form-control mb-1'
                            required
                            ref={(input) => { this.project = input }}
                        />
                        
                        <input
                            type='submit'
                            className='btn btn-block btn-primary mt-4'
                            value='Create'
                        />
                    </form>
                </div>

                <hr />
                <div className="container mr-auto ml-auto mb-5 mt-4">
                    <h2>Check Certificates</h2>
                    <div className="mt-4">
                        <h3>1. Is certified company</h3>
                        <form onSubmit={(event) => {
                            event.preventDefault()
                            const company = this.company.value
                            this.isCertified(company)
                        }}>
                            <label for="company">Company Address</label>
                            <input
                                id='company'
                                type='text'
                                className='form-control mb-1'
                                maxlength="42"
                                minLength="42"
                                required
                                ref={(input) => { this.company = input }}
                            />
                            <input
                                type='submit'
                                className='btn btn-block btn-primary mt-4'
                                value='Check'
                            />
                            <div className="mt-3">
                                <p> <b>{this.state.certificateStatus}</b></p>
                            </div>
                        </form>

                    </div>

                    <div className="mt-4">
                        <h3>2. Get certified Projects</h3>
                        <form onSubmit={(event) => {
                            event.preventDefault()
                            const address = this.address.value
                            this.getProjects(address)
                        }}>
                            <label for="company">Company Address</label>
                            <input
                                id='company'
                                type='text'
                                className='form-control mb-1'
                                maxlength="42"
                                minLength="42"
                                required
                                ref={(input) => { this.address = input }}
                            />
                            <input
                                type='submit'
                                className='btn btn-block btn-primary mt-4'
                                value='Get Projects'
                            />
                        </form>
                        <div className="mt-3">

                            <ul>{this.state.projectList}</ul>
                        </div>
                    </div>

                    <div className="mt-4">
                        <h3>3. Get certificate address</h3>
                        <form onSubmit={(event) => {
                            event.preventDefault()
                            const companyAddress = this.companyAddress.value
                            this.getCertificate(companyAddress)
                        }}>
                            <label for="company">Company Address</label>
                            <input
                                id='company'
                                type='text'
                                className='form-control mb-1'
                                maxlength="42"
                                minLength="42"
                                required
                                ref={(input) => { this.companyAddress = input }}
                            />
                            <input
                                type='submit'
                                className='btn btn-block btn-primary mt-4'
                                value='Get Address'
                            />
                        </form>
                        <div className="mt-3">
                            <p> <b>{this.state.certificateAddress}</b></p>
                        </div>
                    </div>

                </div>

            </>
        )
    }
}

export default Certifier;