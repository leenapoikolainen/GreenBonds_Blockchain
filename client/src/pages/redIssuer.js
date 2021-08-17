import React, { Component } from 'react';
import Web3 from 'web3'

// Import link button
import ButtonBack from '../components/backToRed';

// Import smart Contracts
import GreenBond from '../contracts/GreenBond2.json';

class RedIssuer extends Component {

    async componentWillMount() {
        await this.loadBlockchainData()
    }

    async loadBlockchainData() {
        const web3 = new Web3(window.web3.currentProvider)

        // Load account
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })

        // Network connection
        const networkId = await web3.eth.net.getId()
        const networkData = GreenBond.networks[networkId]
        if (networkData) {
            // Get the Green bond contract
            const greenBond = new web3.eth.Contract(GreenBond.abi, networkData.address)
            this.setState({ greenBond })


            // Bond details
            const symbol = await greenBond.methods.symbol().call()
            this.setState({ symbol })


            // Get time
            let date = new Date()
            let time = date.getTime()

            // bid closing time
            const bidClosingTimeStamp = await greenBond.methods.getBidClosingTime().call()
            const bidClosingTime = this.timeConverter(bidClosingTimeStamp)
            this.setState({ bidClosingTime })

            // IssueDate
            const issueDateTimeStamp = await greenBond.methods.getIssueDate().call()
            const issueDate = this.timeConverter(issueDateTimeStamp)
            this.setState({ issueDate })

            // Bidding open
            let biddingOpen = true;
            if (bidClosingTimeStamp * 1000 < time) {
                biddingOpen = false;
            }
            this.setState({ biddingOpen })

            // Coupon
            const coupon = await greenBond.methods.getCoupon().call()
            this.setState({ coupon })


            // Cancelled
            const cancelled = await greenBond.methods.cancelled().call()
            this.setState({ cancelled })

            // Coupon confirmed
            const couponConfirmed = await greenBond.methods.couponDefined().call()
            this.setState({ couponConfirmed })


            // Token count
            const tokens = await greenBond.methods.bondCount().call()
            this.setState({ tokens })

            // Issuer 
            const issuer = await greenBond.methods.owner().call()
            this.setState({ issuer })
            const issuerTokens = await greenBond.methods.balanceOf(issuer).call()
            this.setState({ issuerTokens })

            const URI = await greenBond.methods.getBaseURI().call()
            this.setState({ URI })

        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
    }

    // Issuing function
    issue = () => {
        this.state.greenBond.methods.issueBonds().send({ from: this.state.account })
    }

    defineCoupon = () => {
        this.state.greenBond.methods.defineCoupon().send({ from: this.state.account })
    }

    timeConverter(UNIX_timestamp) {
        var dateObject = new Date(UNIX_timestamp * 1000);
        return dateObject.toLocaleString()
    }



    timeConverter2(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var seconds = a.getSeconds();

        return (date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + seconds);

    }

    timeConverterDateYear(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();

        return (date + ' ' + month + ' ' + year);

    }



    constructor(props) {
        super(props)
        this.state = {
            account: '',
            greenBond: null,
            numberOfInvestors: 0,
            investors: [],
            balances: [],
            tokens: 0,
            isOpen: true,
            cancelled: false,
        }
    }


    render() {
        return (
            <>
                <div className="container mr-auto ml-auto">
                    {this.state.issuer == this.state.account
                        ? <div className="alert alert-success text-center" role="alert">
                            You're logged in as issuer {this.state.issuer}
                        </div>
                        : <div className="alert alert-danger text-center" role="alert">
                            This page is only for issuer {this.state.issuer}
                        </div>
                    }

                    <h2>Bond: {this.state.symbol}</h2>
                    <ButtonBack />
                </div>
                <hr />

                <div className="container mr-auto ml-auto mt-4">
                    <h2>Define Coupon</h2>
                    {this.state.biddingOpen
                        ? <div className="alert alert-secondary text-center" role="alert">
                            Bidding is still open - can't define the coupon yet.
                        </div>
                        : <div className="mt-4">
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                this.defineCoupon()
                            }}>
                                <input
                                    type='submit'
                                    className='btn btn-block btn-primary'
                                    value='DEFINE'
                                />
                            </form>
                        </div>
                    }

                    <div className="mt-2">

                        {this.state.couponConfirmed
                            ? <div className="alert alert-success text-center" role="alert">
                                Coupon defined: {this.state.coupon}
                            </div>
                            : <div></div>
                        }

                        {this.state.cancelled
                            ? <div className="alert alert-danger text-center" role="alert">
                                Bond issue was cancelled.
                            </div>
                            : <div></div>
                        }

                    </div>
                </div>

                <hr />


                <div className="container mr-auto ml-auto">
                    <h2>Issue Tokens</h2>
                    <p>Expected Issue Date: {this.state.issueDate}</p>

                    {this.state.couponConfirmed
                        ? <div>
                            <form onSubmit={(event) => {
                                event.preventDefault()
                                this.issue()
                            }}>
                                <input
                                    type='submit'
                                    className='btn btn-block btn-primary'
                                    value='ISSUE'
                                />
                            </form>
                        </div>
                        : <div className="alert alert-secondary text-center" role="alert">
                            Coupon has not been confirmed - can't issue bonds yet.
                        </div>
                    }

                    <div className="mt-2">
                        {this.state.tokens > 0
                            ? <div className="alert alert-success text-center" role="alert">
                                Issue is active.
                            </div>
                            : <div className="alert alert-secondary text-center" role="alert">
                                Issue is deactive.
                            </div>
                        }
                    </div>
                   
                    <hr/>

                    <div className="mt-2 pb-5">
                        <p>Number of bonds in circulation: {this.state.tokens}</p>
                    </div>

                </div>

            </>
        )
    }
}

export default RedIssuer;