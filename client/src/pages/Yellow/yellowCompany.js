import React, { Component } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../../contracts/BondYellow.json';

import Pagination from '../../components/Yellow/pagination';

class YellowCompany extends Component {
    async componentDidMount() {
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

            const company = await greenBond.methods.getCompany().call()
            this.setState({ company })

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

            const issued = await greenBond.methods.issued().call()
            this.setState({ issued })

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
        this.state.greenBond.methods.makeCouponPayment().send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
    }

    payPrincipal = (bonds) => {
        let amount = (bonds * this.state.faceValue).toString()
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
                    <Pagination />
                    <div className="mt-4">
                        {this.state.company == this.state.account
                            ? <div className="alert alert-success text-center" role="alert">
                                You're logged in as the borrowing company {this.state.company}
                            </div>
                            : <div className="alert alert-danger text-center" role="alert">
                                This page is only for the borrowing company {this.state.company}
                            </div>
                        }
                    </div>
                </div>

                <div className="container mr-auto ml-auto">
                    {this.state.cancelled
                        ? <div className="alert alert-danger text-center" role="alert">
                            Bond issue has been cancelled due to inadequate demand.
                        </div>
                        : <div> </div>
                    }
                </div>

                <hr />

                <div className="container mr-auto ml-auto mb-5">
                    <h2>Pay coupon</h2>
                    <p><b>Coupon Dates:</b></p>
                    <ul>{this.state.couponList}</ul>

                    {this.state.account != this.state.company
                        ? <div className="alert alert-secondary text-center" role="alert">
                        Functionality not available.
                        </div>
                        : <div> </div>
                    }
                    {!this.state.issued && this.state.account == this.state.company
                        ? <div className="alert alert-secondary text-center" role="alert">
                            Bonds have not been issued yet.
                        </div>
                        : <div> </div>
                    }
                    {this.state.issued && this.state.account == this.state.company
                        ? <div>
                            {this.state.couponsPaid >= this.state.coupons
                                ? <div className="alert alert-danger text-center" role="alert">
                                    Note: all expected coupons have already been paid!
                                </div>
                                : <div></div>
                            }
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
                        </div>
                        : <div> </div>
                    }
                   

                    <div className="mt-2">
                        <p>Coupons paid: {this.state.couponsPaid}/{this.state.coupons}</p>
                        <ul>{this.state.actualDatesList}</ul>
                    </div>

                </div>

                <hr />

                <div className="container mr-auto ml-auto mb-5">
                    <h2>Pay Back Principal</h2>
                    <p><b>Maturity Date:</b> {this.state.maturityDate}</p>

                    {this.state.account != this.state.company
                        ? <div className="alert alert-secondary text-center" role="alert">
                        Functionality not available.
                        </div>
                        : <div> </div>
                    }

                    {this.state.principalPaymentMade
                            ? <div className="alert alert-danger text-center" role="alert">
                                Note: Principal was paid back on: <i> {this.state.principalPaymentDate} </i>
                                </div>
                            : <div></div>
                    }
                    {!this.state.issued && this.state.account == this.state.company
                        ? <div className="alert alert-secondary text-center" role="alert">
                        Bonds have not been issued yet. Can't make principal payment yet.
                        </div>
                        : <div></div>
                    }
                    {this.state.issued && this.state.account == this.state.company
                        ? <div>
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
                        </div>
                        : <div> </div>
                    }



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

export default YellowCompany;