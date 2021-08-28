import React, { Component } from 'react';
import Web3 from 'web3'

// Import smart Contracts

import GreenCertifier from '../contracts/GreenCertificateRepository.json'


class Certifier extends Component {

    async componentDidMount() {
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


            const repoAddress = greenCertifier.options.address
            this.setState({ repoAddress })

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
                    <div className="jumbotron">
                        <h1 className="">Green Certificate Repository</h1>
                        <hr className="my-4"></hr>
                        <p className="lead">
                            Anyone can query the Green Certificate Repository, and check
                            whether a company has a green certificate, and which projects
                            have been approved for green bond financing under that certificate.
                        </p>
                        <p className="lead">
                            If you are logged in as green certifier, you can also create new certificates
                            for projects that you have assessed to be eligible for green financing.
                        </p>
                        <hr className="my-4"></hr>
                        <p>Contract address: {this.state.repoAddress}</p>
                    </div>
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
                                minLength="42"
                                maxlength="42"
                                required pattern="0x.+"
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
                        <hr />
                    </div>

                    <div className="mt-4">
                        <h3>2. Get certified projects for a compnay</h3>
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
                                minLength="42"
                                maxlength="42"
                                required pattern="0x.+"
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
                        <hr />
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
                                minLength="42"
                                maxlength="42"
                                required pattern="0x.+"
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

                <hr />

                <div className="container mr-auto ml-auto mb-5">
                    <h2>Create certificate</h2>
                    {this.state.certifier == this.state.account
                        ? <div className="container mr-auto ml-auto">
                            <div className="alert alert-success text-center" role="alert">
                                You're logged in as certifier {this.state.certifier} and can create certificates.
                            </div>
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
                                    minLength="42"
                                    maxlength="42"
                                    required pattern="0x.+"
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
                        : <div className="alert alert-danger text-center" role="alert">
                            Only certifier {this.state.certifier} can create certificates.
                        </div>
                    }
                </div>


            </>
        )
    }
}

export default Certifier;