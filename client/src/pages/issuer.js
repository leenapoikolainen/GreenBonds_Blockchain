import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond2.json';

class Issuer extends Component {

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
            const company = await greenBond.methods.getCompany().call()
            this.setState({ company })

            const project = await greenBond.methods.name().call()
            this.setState({ project })

            // Get time
            let d = new Date()
            let time = d.getTime()
            let date = this.timeConverter(time)
            this.setState({ date })

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



            /*
            for (var i = 1; i <= numberOfInvestors; i++) {
                const investor = await greenBond.methods._investors(i - 1).call()
                const balance = await greenBond.methods.getInvestorBalance(investor).call()
                this.setState({
                    investors: [...this.state.investors, investor]
                })
                this.setState({
                    balances: [...this.state.balances, balance]
                })
            }
            */

            // Token count
            const tokens = await greenBond.methods.bondCount().call()
            this.setState({ tokens })
            console.log("Number of tokens issued", tokens)

            // Issuer 
            const issuer = await greenBond.methods.owner().call()
            this.setState({ issuer })
            const issuerTokens = await greenBond.methods.balanceOf(issuer).call()
            this.setState({ issuerTokens })

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
                    <h2 >Bond Details</h2>
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
                            <td>Bid Closing time</td>
                            <td>{this.state.bidClosingTime}</td>
                        </tr>
                        <tr>
                            <td>Issue Date</td>
                            <td>{this.state.issueDate}</td>
                        </tr>
                    </table>
                </div>
                <hr />
                <div className="container mr-auto ml-auto">
                    <h2>These can only be used by: {this.state.issuer}</h2>
                </div>
                <hr />
                <div className="container mr-auto ml-auto">

                    <h2>Define Coupon</h2>
                    <p>{this.state.biddingOpen
                        ? <p>Bidding is open. Can't define coupon yet</p>
                        : <p>Bidding is closed and
                            {this.state.couponConfirmed ? " coupon defined." : " coupon not defined yet."}</p>

                    }</p>
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
                    <div className="mt-2">
                        <i>
                            {this.state.couponConfirmed
                                ? <p>Coupon: {this.state.coupon}</p>
                                : <p>Coupon: undefined</p>
                            }
                        </i>
                        <i>
                            {this.state.cancelled
                                ? <p>Coupon: N/A</p>
                                : <p></p>
                            }
                        </i>
                    </div>
                    <div className="container mr-auto ml-auto mb-5">
                        {this.state.couponConfirmed
                            ? <div className="alert alert-success" role="alert">
                                Bond issue confirmed.
                            </div>
                            : 
                            <div className="alert alert-danger" role="alert">
                                Bond issue cancelled.
                            </div>
                        }
                    </div>

                </div>

                <hr />
                <div className="container mr-auto ml-auto">
                    <h2>Issue Tokens</h2>
                    <p>Expected Issue Date: {this.state.issueDate}</p>
                    
                    
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

                    <div className="container mr-auto ml-auto mt-5 mb-5">
                        {this.state.tokens > 0
                            ? <div className="alert alert-success" role="alert">
                                Bonds issue active.
                            </div>
                            : 
                            <div className="alert alert-secondary" role="alert">
                                Bonds issue deactive.
                            </div>
                        }
                    </div>

                    <div className="mt-2 pb-5">
                        <p>Number of bonds in circulation: {this.state.tokens}</p>
                        <p>Number of bonds returned to issuer: {this.state.issuerTokens}</p>
                    </div>

                </div>

            </>
        )
    }
};

export default Issuer;