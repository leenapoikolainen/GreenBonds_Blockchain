import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3'

// Import link button
import ButtonBack from '../components/backToBlue';

// Import smart Contracts
import GreenBond from '../contracts/GreenBond3.json';

class BlueCompany extends Component {
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

            const symbol = await greenBond.methods.symbol().call()
            this.setState({ symbol })


            const faceValue = await greenBond.methods.getFaceValue().call()
            this.setState({ faceValue })

            const numberOfBonds = await greenBond.methods.getNumberOfBondsSought().call()
            this.setState({ numberOfBonds })


            const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
            const maturityDate = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate })

            let couponDates = await greenBond.methods.getCouponDates().call()
            const couponList = couponDates.map((date) =>
                <li>{this.timeConverter(date)}</li>
            );
            this.setState({ couponList })

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

            // Actual coupon payments
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



    payCoupon = (bonds) => {
        let amount = (bonds * this.state.coupon).toString()
        console.log(amount)
        this.state.greenBond.methods.makeCouponPayment().send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
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

        }
    }

    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    <h2>Bond: {this.state.symbol}</h2>
                    
                </div>

                <div className="container mr-auto ml-auto">
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
                    <ButtonBack />
                </div>

                <hr />
                <div className="container mr-auto ml-auto mb-5">
                    <h2>Pay coupon</h2>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const bonds = this.state.numberOfBonds
                        this.payCoupon(bonds)
                    }}>
                        <input
                            type='submit'
                            className='btn btn-block btn-primary'
                            value='Make coupon payment'
                        />
                    </form>
                    <div className="mt-2">
                        <p>Coupons paid: {this.state.couponsPaid}/{this.state.coupons}</p>
                        <ul>{this.state.actualDatesList}</ul>
                    </div>
                </div>

                <hr />

                <div className="container mr-auto ml-auto mb-5">
                    <h2>Pay Back Principal</h2>
                    <p>Maturity Date: {this.state.maturityDate}</p>
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        const bonds = this.state.numberOfBonds
                        this.payPrincipal(bonds)
                    }}>
                        <input
                            type='submit'
                            className='btn btn-block btn-primary'
                            value='Make principal payment'
                        />

                    </form>

                    <div className="mt-2">
                        {this.state.principalPaymentMade
                            ? <p>Principal paid back on: <i> {this.state.principalPaymentDate} </i></p>
                            : <p>Principal has not been paid back yet</p>}
                    </div>



                </div>

            </>


        );
    }
}

export default BlueCompany;