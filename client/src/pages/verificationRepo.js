import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import VerificationRepository from '../contracts/GreenVerificationRepository.json';

class VerificationRepo extends Component {
    async componentWillMount() {
        await this.loadBlockchainData()
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

        // Load account - first one
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })

        // Network connection
        const networkId = await web3.eth.net.getId()
        const networkData = VerificationRepository.networks[networkId]

        if (networkData) {
            // Get the verification repo contract
            const verificationRepository = new web3.eth.Contract(VerificationRepository.abi, networkData.address)
            this.setState({ verificationRepository })

            const verifier = await verificationRepository.methods.getOwner().call()
            this.setState({ verifier })


        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    addVerification = (bond, result) => {
        this.state.verificationRepository.methods.addVerification(bond, result).send({ from: this.state.account })
    }

    isVerifiedBond = async (symbol) => {
        const verificationExists = await this.state.verificationRepository.methods.isVerifiedBond(symbol).call()
        let verificationStatus

        if (verificationExists) {
            verificationStatus = "Verification exists"
        } else {
            verificationStatus = "Verification does not exist"
        }
        this.setState({ verificationStatus })
    }

    getVerification = async (symbol) => {
        const verificationAddress = await this.state.verificationRepository.methods.getVerificationAddress(symbol).call()
        this.setState({ verificationAddress })
    }

    getResults = async (symbol) => {
        const results = await this.state.verificationRepository.methods.getResults(symbol).call()

        const resultList = results.map((result) =>
            <li>{result}</li>
        );
        this.setState({ resultList })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            contract: null,
            couponPaymentDates: [],

        }
    }

    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    <p>Green Verifier: {this.state.verifier}</p>
                </div>

                <div className="container mr-auto ml-auto">
                    <h2>Add Verification</h2>

                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const symbol = this.symbol.value
                        const result = this.result.value

                        this.addVerification(symbol, result)
                    }}>

                        <label for="symbol">Bond symbol</label>
                        <input
                            id='symbol'
                            type='text'
                            className='form-control mb-1'
                            required
                            ref={(input) => { this.symbol = input }}
                        />

                        <label for="result">Verification result (in percentage, e.g. 70% = 70, 150% = 150</label>
                        <input
                            id='result'
                            type='number'
                            min='0'
                            className='form-control mb-1'
                            required
                            ref={(input) => { this.result = input }}
                        />
                        <input
                            type='submit'
                            className='btn btn-block btn-primary mt-4'
                            value='Add'
                        />
                    </form>
                    <hr />
                    <div className="container mr-auto ml-auto mb-5">
                        <h2>Check verifications</h2>
                        <div className="mt-4">
                            <h3>Has verification</h3>
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                const symbol = this.symbol.value
                                this.isVerifiedBond(symbol)
                            }}>
                                <label for="symbol">Bond Symbol</label>
                                <input
                                    id='symbol'
                                    type='text'
                                    className='form-control mb-1'
                                    required
                                    ref={(input) => { this.symbol = input }}
                                />
                                <input
                                    type='submit'
                                    className='btn btn-block btn-primary mt-4'
                                    value='Check'
                                />
                                <div className="mt-3">
                                    <p> <b>{this.state.verificationStatus}</b></p>
                                </div>
                            </form>
                        </div>

                        <div className="mt-4">
                            <h3>Get verification address</h3>
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                const symbol = this.symbol.value
                                this.getVerification(symbol)
                            }}>
                                <label for="symbol">Bond Symbol</label>
                                <input
                                    id='symbol'
                                    type='text'
                                    className='form-control mb-1'
                                    required
                                    ref={(input) => { this.symbol = input }}
                                />
                                <input
                                    type='submit'
                                    className='btn btn-block btn-primary mt-4'
                                    value='Get Address'
                                />
                            </form>
                            <div className="mt-3">
                                <p> <b>{this.state.verificationAddress}</b></p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h3>Get verification results</h3>
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                const symbol = this.symbol.value
                                this.getResults(symbol)
                            }}>
                                <label for="symbol">Bond Symbol</label>
                                <input
                                    id='symbol'
                                    type='text'
                                    className='form-control mb-1'
                                    required
                                    ref={(input) => { this.symbol = input }}
                                />
                                <input
                                    type='submit'
                                    className='btn btn-block btn-primary mt-4'
                                    value='Get Results'
                                />
                            </form>
                            <div className="mt-3">

                                <ul>{this.state.resultList}</ul>
                            </div>
                        </div>

                    </div>

                </div>

            </>


        );
    }
}

export default VerificationRepo;