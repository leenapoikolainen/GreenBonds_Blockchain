import React, { Component } from 'react';
import Web3 from 'web3'


// Import smart Contracts
import GreenBond from '../../contracts/BondBlue.json';

// Import Pagination
import Pagination from '../../components/Blue/pagination';

class BlueRegulator extends Component {
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

            const symbol = await greenBond.methods.symbol().call()
            this.setState({ symbol })


            const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
            const maturityDate = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate })

            // Expected coupon payment dates
            let couponDates = await greenBond.methods.getCouponDates().call()
            const couponList = couponDates.map((date) =>
                <li>{this.timeConverter(date)}</li>
            );
            this.setState({ couponList })

            // Actual coupon payment dates
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

            // Status
            const cancelled = await greenBond.methods.cancelled().call()
            this.setState({ cancelled })

            const couponConfirmed = await greenBond.methods.couponDefined().call()
            this.setState({ couponConfirmed })

            const issued = await greenBond.methods.issued().call()
            this.setState({ issued })

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


    couponMadeOnTime = async (coupon) => {
        let couponResult = await this.state.greenBond.methods.couponPaymentOnTime(coupon).call({ from: this.state.account })
        this.setState({ couponResult })
    }

    principalMadeOnTime = async () => {
        let principalResult = await this.state.greenBond.methods.principalPaidOnTime().call({ from: this.state.account })
        this.setState({ principalResult })
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
                    <div className="container mr-auto ml-auto">
                        <Pagination />
                    </div>
                    <div className="mt-4">
                        {this.state.cancelled
                            ? <div className="alert alert-danger text-center" role="alert">
                                Bond issue was cancelled due to inadequate demand.
                            </div>
                            : <div> </div>
                        }
                        {this.state.issued
                            ? <div className="alert alert-success text-center" role="alert">
                                Bonds have been issued.
                            </div>
                            : <div className="alert alert-secondary text-center" role="alert">
                                Bonds have not been issued yet.
                            </div>
                        }
                    </div>


                </div>
                <hr />

                <div className="container mr-auto ml-auto">
                    <h2>Check coupon payments</h2>
                    <p>Expected coupon payment dates:</p>
                    <ul>{this.state.couponList}</ul>
                    <p>Actual coupon payment dates:</p>
                    <ul>{this.state.actualDatesList}</ul>
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
                <hr />

                <div className="container mr-auto ml-auto">
                    <h2>Check Principal Payment</h2>
                    <p>Expected Principal Payment Date: </p>
                    <ul><li>{this.state.maturityDate}</li></ul>
                    <p>Actual Principal Payment Date: </p>
                    <ul>{this.state.principalPaymentMade
                        ? <li>{this.state.principalPaymentDate}</li>
                        : <li><i>Not paid yet</i></li>

                    }</ul>

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
                <hr />


            </>


        );
    }
}

export default BlueRegulator;