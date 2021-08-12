import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import VerificationRepository from '../contracts/GreenVerificationRepository.json';


class VerificationRepo extends Component {
    async componentWillMount() {
        await this.loadBlockchainData()
        await this.loadWeb3()

        // Set targets
        let target1 = 100
        let target2 = 20
        let target3 = 50
        let target4 = 60
        this.setState({ target1 })
        this.setState({ target2 })
        this.setState({ target3 })
        this.setState({ target4 })
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

    calculate = (kpi1, kpi2, kpi3, kpi4) => {
        // For KPI1 need reverse calculation - i.e. the smaller the consumption agains target
        // the better the result
        let result1 = this.reverseresult(kpi1, this.state.target1)
        let result2 = kpi2 / this.state.target2
        let result3 = kpi3 / this.state.target3
        let result4 = kpi4 / this.state.target4
        let finalScore = (result1 + result2 + result3 + result4) / 4
        this.setState({ finalScore })
    }

    reverseresult = (kpi, target) => {
        let result = 1 - kpi / target + 1;
        if (result < 0) {
            result = 0;
        }
        return result;
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
            finalScore: 0,
        }
    }

    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    <p>Green Verifier: {this.state.verifier}</p>
                </div>

                <div className="container mr-auto ml-auto">
                    <div className="border border-success py-4 px-4 mb-5">
                        <h2>Scoring KPI target achievement</h2>
                        <p>The bond KPIs can be retrieved from the green certificate,
                            which lists the categories and the targets.
                            The Green Verifier assessess the company's performance
                            against these KPIs and calculates an overall performace score.
                            The overall performance score is an average of the performance against
                            each individual KPI.
                        </p>
                        <p>The result is recorded on the blockchain,
                            and the coupon is adjusted as explained below:
                        </p>
                        <table className="table">
                            <tr>
                                <th>Overall Score</th>
                                <th>Coupon Adjustment</th>
                            </tr>
                            <tr>
                                <td>Below 50%</td>
                                <td>+2 bp</td>
                            </tr>
                            <tr>
                                <td>50 - 90%</td>
                                <td>+1 bp</td>
                            </tr>
                            <tr>
                                <td>91 - 110%</td>
                                <td>No adjustment</td>
                            </tr>
                            <tr>
                                <td>110 - 150%</td>
                                <td>- 1 bp</td>
                            </tr>
                            <tr>
                                <td>Over 150%</td>
                                <td>- 2 bp</td>
                            </tr>
                        </table>
                    </div>

                    <h2>Calculate score</h2>
                    <form onSubmit={(event => {
                        event.preventDefault();
                        const result1 = this.result1.value
                        const result2 = this.result2.value
                        const result3 = this.result3.value
                        const result4 = this.result4.value
                        this.calculate(result1, result2, result3, result4)
                    })}>

                        <label
                            for="kpi1"
                            className="font-weight-bold"
                        >Energy Performance - kwH/m2</label>
                        <input
                            id='kpi1'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result1 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target1} kWh/m2</span>
                        <br />
                        <br />
                        <label
                            for="kpi2"
                            className="font-weight-bold"
                        >Carbon performance - % percentage of carbon emissions avoided vs. local baseline</label>
                        <input
                            id='kpi2'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result2 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target2} %</span>
                        <br />
                        <br />
                        <label
                            for="kpi3"
                            className="font-weight-bold"
                        >Water efficiency - amount of rainwater harvested m3/a</label>
                        <input
                            id='kpi3'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result3 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target3} %</span>
                        <br />
                        <br />
                        <label
                            for="kpi4"
                            className="font-weight-bold"
                        >Waste management - recycling percentage</label>
                        <input
                            id='kpi4'
                            type='number'
                            className='form-control mb-1'
                            min='0'
                            required
                            ref={(input) => { this.result4 = input }}
                        />
                        <span className="font-weight-light">Target: {this.state.target4} %</span>
                        <br />
                        <br />

                        <button
                            type="submit"
                            className='btn btn-block btn-primary mt-4'
                        >Calculate</button>
                        <br />
                        <br />
                        <div className="border border-danger mb-4">
                            <p className="font-weight-bold px-3 py-4">Overall Score: {this.state.finalScore}</p>
                        </div>

                    </form>
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