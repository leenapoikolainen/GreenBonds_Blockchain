import React, { Component } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import VerificationRepository from '../contracts/GreenVerificationRepository.json';


class VerificationRepo extends Component {
    async componentDidMount() {
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

            const repoAddress =  verificationRepository.options.address
			this.setState({ repoAddress })

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
            resultList: [],
        }
    }

    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    <div className="jumbotron">
                        <h1 className="">Green Verification Repository</h1>
                        <hr className="my-4"></hr>
                        <p className="lead">
                            Anyone can query the Green Verification Repository, and check
                            whether a bond's KPI achievements have been verified, and check the
                            verification results.
                        </p>
                        <p className="lead">
                            If you are logged in as green verfier, you can also add new verifications
                            for bonds that you have assessed. You can calculate the performance
                            score by typing in the verification results to the calculator.
                        </p>
                        <hr className="my-4"></hr>
                        <p>Contract address: {this.state.repoAddress}</p>
                    </div>
                </div>

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
                        <hr />
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
                        <hr />
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
                <hr />
                <div className="container mr-auto ml-auto">
                    <div className="border border-success py-4 px-4 mb-5">
                        <h2>KPI target achievement and coupon adjustment</h2>
                        <p> The bond KPIs are industry specific, and the above criteria
                            applies to all bonds on this platform.
                            The Green Verifier assessess the company's performance
                            against these KPIs and calculates an overall performace score,
                            which is calculated as an average of the percentage performance against
                            each individual KPI. Assement is done before each coupon payment,
                            and the result is recorded on the bond-specific smart contract
                            on the blockchain.
                        </p>
                        <p> The issuing institution checks the  bond specific results before
                            each coupon payment is due, and adjusts the coupon based on the below table.
                            Missing the goals can lead to an increase in the coupon rate, where as
                            overperforming can reduce the coupon rate.
                        </p>
                        <table className="table">
                            <tr>
                                <th>Overall Score</th>
                                <th>Coupon Adjustment</th>
                            </tr>
                            <tr>
                                <td>Below 50%</td>
                                <td>+20 bp</td>
                            </tr>
                            <tr>
                                <td>50 - 90%</td>
                                <td>+10 bp</td>
                            </tr>
                            <tr>
                                <td>91 - 110%</td>
                                <td>No adjustment</td>
                            </tr>
                            <tr>
                                <td>110 - 150%</td>
                                <td>- 10 bp</td>
                            </tr>
                            <tr>
                                <td>Over 150%</td>
                                <td>- 20 bp</td>
                            </tr>
                        </table>
                    </div>
                </div>

                <hr />

                <div className="container mr-auto ml-auto">
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
                            <p className="font-weight-bold px-3 py-3">Overall Score: {this.state.finalScore}</p>
                        </div>
                    </form>
                    <hr />
                </div>

                <div className="container mr-auto ml-auto mb-5">
                    <h2>Add Verification</h2>

                    <div className="container mr-auto ml-auto">
                    {this.state.verifier == this.state.account
                        ? <div className="container mr-auto ml-auto mb-5">
                            <div className="alert alert-success text-center" role="alert">
                                You're logged in as certifier {this.state.verifier} and can add verifications.
                            </div>
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
                        </div>
                        : <div className="alert alert-danger text-center" role="alert">
                            Only verifier {this.state.verifier} can add verifications.
                        </div>
                    }
                    </div>

                    

                </div>

            </>
        );
    }
}

export default VerificationRepo;