import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond2.json';

class Regulation extends Component {
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
        const networkData = GreenBond.networks[networkId]

        if (networkData) {
            // Get the Green bond contract
            const greenBond = new web3.eth.Contract(GreenBond.abi, networkData.address)
            this.setState({ greenBond })

            // Getting bond details
            const company = await greenBond.methods.getCompany().call()
            this.setState({ company })

            const project = await greenBond.methods.name().call()
            this.setState({ project })

            const symbol = await greenBond.methods.symbol().call()
            this.setState({ symbol })

            const term = await greenBond.methods.getTerm().call()
            this.setState({ term })

            const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
            const maturityDate = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate })

            let couponDates = await greenBond.methods.getCouponDates().call()
            const couponList = couponDates.map((date) =>
                <li>{this.timeConverter(date)}</li>
            );
            this.setState({ couponList })

            const couponPayments = await greenBond.methods.getNumberOfCoupons().call()
            const couponLimit = couponPayments.toString()
            this.setState({couponLimit})

            // Status
            const cancelled = await greenBond.methods.cancelled().call()
            this.setState({ cancelled })

            const couponConfirmed = await greenBond.methods.couponDefined().call()
            this.setState({ couponConfirmed })

            // Set coupon
            let coupon = await greenBond.methods.getCoupon().call()
            this.setState({ coupon })

            // Coupons payment count
            const coupons = await greenBond.methods.getNumberOfCoupons().call()
            this.setState({ coupons })

            const couponsPaid = await greenBond.methods.getNumberOfCouponsPaid().call()
            this.setState({ couponsPaid })

            var dateArray = []
            for (var i = 1; i <= couponsPaid; i++) {
                let date = await greenBond.methods.getActualCouponDate(i).call()
                dateArray.push(date)
            }

            const actualDatesList = dateArray.map((date) =>
                <li>{this.timeConverter(date)}</li>

            );
            this.setState({ actualDatesList })

            // Get actual principal payment date
            const principalPaymentDateTimeStamp = await greenBond.methods.getActualPricipalPaymentDate().call()

            let principalPaymentMade;

            // If it's larger than zero, date has been updated
            if (principalPaymentDateTimeStamp > 0) {
                principalPaymentMade = true;
            } else {
                principalPaymentMade = false;
            }

            this.setState({ principalPaymentMade })


            const principalPaymentDate = this.timeConverter(principalPaymentDateTimeStamp)
            this.setState({ principalPaymentDate })

        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    timeConverter(UNIX_timestamp) {
        var dateObject = new Date(UNIX_timestamp * 1000);
        return dateObject.toLocaleString()
    }
   
    
    couponMadeOnTime = async(coupon) => {  
        let couponResult = await this.state.greenBond.methods.couponPaymentOnTime(coupon).call({ from: this.state.account })    
        this.setState({ couponResult })
    }

    principalMadeOnTime = async() => {
        let principalResult = await this.state.greenBond.methods.principalPaidOnTime().call({ from: this.state.account })
        this.setState({ principalResult })
    }

    payCoupon = (bonds) => {

        let amount = (bonds * this.state.coupon).toString()
        console.log(amount)
        this.state.greenBond.methods.payCoupons().send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
    }

    payPrincipal = (bonds) => {
        let amount = (bonds * this.state.faceValue).toString()
        console.log(amount)
        this.state.greenBond.methods.payBackBond().send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            contract: null,
            couponPaymentDates: [],
            couponResult: '',
            principalResult: '',
        }
    }

    render() {
        return (
            <>

                <div className="container mr-auto ml-auto">
                    <h2 >Bond Details</h2>
                    {this.state.cancelled
                        ? <div className="alert alert-danger" role="alert">
                            Bond Issue has been cancelled due to inadequate demand.
                        </div>
                        : <div> </div>
                    }
                    {this.state.couponConfirmed
                        ? <div className="alert alert-success" role="alert">
                            Bond issue has been confirmed.
                        </div>
                        : <div className="alert alert-secondary" role="alert">
                            Bond issue has not been confirmed.
                        </div>
                    }

                    <table className="table mt-5">
                        <tr>
                            <td>Company</td>
                            <td>{this.state.company}</td>
                        </tr>
                        <tr>
                            <td>Project</td>
                            <td>{this.state.project}</td>
                        </tr>
                        <tr>
                            <td>Symbol</td>
                            <td>{this.state.symbol}</td>
                        </tr>
                        <tr>
                            <td>Term</td>
                            <td>{this.state.term} year(s)</td>
                        </tr>
                        <tr>
                            <td>Maturity Date</td>
                            <td>{this.state.maturityDate}</td>
                        </tr>
                    </table>
                    <p>Coupon Payment Dates:</p>
                    <ul>{this.state.couponList}</ul>
                </div>
                <hr />

                <div className="container mr-auto ml-auto">
                    <h2>Check coupon payments</h2>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const coupon = this.coupon.value
                        this.couponMadeOnTime(coupon)
                    }}>
                        <label for="coupon">Coupon</label>
                        <input
                            id='coupon'
                            type='number'
                            className='form-control mb-1'
                            min='1'
                            required
                            ref={(input) => { this.coupon = input }}
                        />
                        
                        <input
                            type='submit'
                            className='btn btn-block btn-primary mt-4'
                            value='Check'
                        />
                    </form>
                    <div className="mt-4">
                        <p>{this.state.couponResult}</p>
                    </div>
                    
                </div>
                <hr/>

                <div className="container mr-auto ml-auto">
                    <h2>Check Principal Payment</h2>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        this.principalMadeOnTime()
                    }}>
                        
                        <input
                            type='submit'
                            className='btn btn-block btn-primary mt-4'
                            value='Check'
                        />
                    </form>
                    <div className="mt-4">
                        <p>{this.state.principalResult}</p>
                    </div>
                    
                </div>
                <hr/>


            </>


        );
    }
}

export default Regulation;