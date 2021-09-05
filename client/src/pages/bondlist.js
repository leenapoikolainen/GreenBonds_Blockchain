import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';

import BondRed from '../contracts/BondRed.json';
import BondPurple from '../contracts/BondPurple.json';
import BondBlue from '../contracts/BondBlue.json';
import BondYellow from '../contracts/BondYellow.json';


class BondList extends Component {
    async componentDidMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3
        
        // Load account
        const accounts = await web3.eth.getAccounts()
		this.setState({ account: accounts[0] })

        // Network connection
        const networkId = await web3.eth.net.getId()
        const networkData = BondRed.networks[networkId]
        const networkData2 = BondBlue.networks[networkId]
        const networkData3 = BondPurple.networks[networkId]
        const networkData4 = BondYellow.networks[networkId]

        if (networkData) {
            // Get the Green bond contract
            const bondRed = new web3.eth.Contract(BondRed.abi, networkData.address)
            this.setState({ bondRed })

            const company = await bondRed.methods.getCompany().call()
            this.setState({ company })

            const project = await bondRed.methods.name().call()
            this.setState({ project })

            const symbol = await bondRed.methods.symbol().call()
            this.setState({ symbol })

            const bidClosingTimeStamp = await bondRed.methods.getBidClosingTime().call()
            const bidClosingTime = this.timeConverter(bidClosingTimeStamp)
            this.setState({ bidClosingTime })

            const timeNow = Date.now()
            let biddingOpen
            if (timeNow / 1000 - bidClosingTimeStamp > 0) {
                biddingOpen = false
            } else {
                biddingOpen = true
            }
            this.setState({ biddingOpen })

            const coupon = await bondRed.methods.getCoupon().call()
            this.setState({ coupon })

            const maturityDateTimeStamp = await bondRed.methods.getMaturityDate().call()
            const maturityDate = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate })

            const cancelled = await bondRed.methods.cancelled().call()
            const confirmed = await bondRed.methods.couponDefined().call()
            const tokens = await bondRed.methods.bondCount().call()
            const principalPaymentDate = await bondRed.methods.getActualPricipalPaymentDate().call()
            let principalPaid;
            if (principalPaymentDate == 0) {
                principalPaid = false;
            } else {
                principalPaid = true;
            }

            if (cancelled) {
                const status = "Cancelled"
                this.setState({ status })
            } else if (!confirmed) {
                const status = "Unconfirmed"
                this.setState({ status })
            } else if (confirmed && tokens == 0 && !principalPaid) {
                const status = "Waiting for issue"
                this.setState({ status })
            } else if (tokens > 0) {
                const status = "Active"
                this.setState({ status })
            } else {
                const status = "Matured"
                this.setState({ status })
            }

            const account = accounts[0];
            const tokensOwned = await bondRed.methods.balanceOf(account).call()
			this.setState({ tokensOwned })

        } else {
            window.alert('Smart contract not deployed to detected network.')
        }

        if (networkData2) {
            // Get the Green bond contract
            const bondBlue = new web3.eth.Contract(BondBlue.abi, networkData2.address)
            this.setState({ bondBlue })

            // First bond
            const company2 = await bondBlue.methods.getCompany().call()
            this.setState({ company2 })

            const project2 = await bondBlue.methods.name().call()
            this.setState({ project2 })

            const symbol2 = await bondBlue.methods.symbol().call()
            this.setState({ symbol2 })

            const bidClosingTimeStamp2 = await bondBlue.methods.getBidClosingTime().call()
            const bidClosingTime2 = this.timeConverter(bidClosingTimeStamp2)
            this.setState({ bidClosingTime2 })

            const timeNow = Date.now()
            let biddingOpen2
            if (timeNow / 1000 - bidClosingTimeStamp2 > 0) {
                biddingOpen2 = false
            } else {
                biddingOpen2 = true
            }
            this.setState({ biddingOpen2 })

            const coupon2 = await bondBlue.methods.getCoupon().call()
            this.setState({ coupon2 })

            const maturityDateTimeStamp = await bondBlue.methods.getMaturityDate().call()
            const maturityDate2 = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate2 })

            const cancelled = await bondBlue.methods.cancelled().call()
            const confirmed = await bondBlue.methods.couponDefined().call()
            const tokens = await bondBlue.methods.bondCount().call()
            const principalPaymentDate = await bondBlue.methods.getActualPricipalPaymentDate().call()
            let principalPaid;
            if (principalPaymentDate == 0) {
                principalPaid = false;
            } else {
                principalPaid = true;
            }
           

            if (cancelled) {
                const status2 = "Cancelled"
                this.setState({ status2 })
            } else if (!confirmed) {
                const status2 = "Unconfirmed"
                this.setState({ status2 })
            } else if (confirmed && tokens == 0 && !principalPaid) {
                const status2 = "Waiting for issue"
                this.setState({ status2 })
            } else if (tokens > 0) {
                const status2 = "Active"
                this.setState({ status2 })
            } else {
                const status2 = "Matured"
                this.setState({ status2 })
            }

            const account = accounts[0];
            const tokensOwned2 = await bondBlue.methods.balanceOf(account).call()
			this.setState({ tokensOwned2 })
        }

        if (networkData3) {
            // Get the Green bond contract
            const purpleBond = new web3.eth.Contract(BondPurple.abi, networkData3.address)
            this.setState({ purpleBond })

            // First bond
            const company3 = await purpleBond.methods.getCompany().call()
            this.setState({ company3 })

            const project3 = await purpleBond.methods.name().call()
            this.setState({ project3 })

            const symbol3 = await purpleBond.methods.symbol().call()
            this.setState({ symbol3 })

            const bidClosingTimeStamp3 = await purpleBond.methods.getBidClosingTime().call()
            const bidClosingTime3 = this.timeConverter(bidClosingTimeStamp3)
            this.setState({ bidClosingTime3 })

            const timeNow = Date.now()
            let biddingOpen3
            if (timeNow / 1000 - bidClosingTimeStamp3 > 0) {
                biddingOpen3 = false
            } else {
                biddingOpen3 = true
            }
            this.setState({ biddingOpen3 })

            const coupon3 = await purpleBond.methods.getCoupon().call()
            this.setState({ coupon3 })

            const maturityDateTimeStamp = await purpleBond.methods.getMaturityDate().call()
            const maturityDate3 = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate3 })

            const cancelled = await purpleBond.methods.cancelled().call()
            const confirmed = await purpleBond.methods.couponDefined().call()          
            const tokens = await purpleBond.methods.bondCount().call()
            const principalPaymentDate = await purpleBond.methods.getActualPricipalPaymentDate().call()
            let principalPaid;
            if (principalPaymentDate == 0) {
                principalPaid = false;
            } else {
                principalPaid = true;
            }


            if (cancelled) {
                const status3 = "Cancelled"
                this.setState({ status3 })
            } else if (!confirmed) {
                const status3= "Unconfirmed"
                this.setState({ status3 })
            } else if (confirmed && tokens == 0 && !principalPaid) {
                const status3 = "Waiting for issue"
                this.setState({ status3 })
            } else if (tokens > 0) {
                const status3 = "Active"
                this.setState({ status3 })
            } else {
                const status3 = "Matured"
                this.setState({ status3 })
            }

            const account = accounts[0];
            const tokensOwned3 = await purpleBond.methods.balanceOf(account).call()
		    this.setState({ tokensOwned3 })
        }  

        if (networkData4) {
            // Get the Green bond contract
            const yellowBond = new web3.eth.Contract(BondYellow.abi, networkData4.address)
            this.setState({ yellowBond })

            // First bond
            const company4 = await yellowBond.methods.getCompany().call()
            this.setState({ company4 })

            const project4 = await yellowBond.methods.name().call()
            this.setState({ project4 })

            const symbol4 = await yellowBond.methods.symbol().call()
            this.setState({ symbol4 })

            const bidClosingTimeStamp4 = await yellowBond.methods.getBidClosingTime().call()
            const bidClosingTime4 = this.timeConverter(bidClosingTimeStamp4)
            this.setState({ bidClosingTime4 })

            const timeNow = Date.now()
            let biddingOpen4
            if (timeNow / 1000 - bidClosingTimeStamp4 > 0) {
                biddingOpen4 = false
            } else {
                biddingOpen4 = true
            }
            this.setState({ biddingOpen4 })

            const coupon4 = await yellowBond.methods.getCoupon().call()
            this.setState({ coupon4 })

            const maturityDateTimeStamp = await yellowBond.methods.getMaturityDate().call()
            const maturityDate4 = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate4 })

            const cancelled = await yellowBond.methods.cancelled().call()
            const confirmed = await yellowBond.methods.couponDefined().call()         
            const tokens = await yellowBond.methods.bondCount().call()
            const principalPaymentDate = await yellowBond.methods.getActualPricipalPaymentDate().call()
            let principalPaid;
            if (principalPaymentDate == 0) {
                principalPaid = false;
            } else {
                principalPaid = true;
            }

            if (cancelled) {
                const status4 = "Cancelled"
                this.setState({ status4 })
            } else if (!confirmed) {
                const status4= "Unconfirmed"
                this.setState({ status4 })
            } else if (confirmed && tokens == 0 && !principalPaid) {
                const status4 = "Waiting for issue"
                this.setState({ status4 })
            } else if (tokens > 0) {
                const status4 = "Active"
                this.setState({ status4 })
            } else {
                const status4 = "Matured"
                this.setState({ status4 })
            }

            const account = accounts[0];
            const tokensOwned4 = await yellowBond.methods.balanceOf(account).call()
		    this.setState({ tokensOwned4 })
        }  
    }

    timeConverter(UNIX_timestamp) {
        var dateObject = new Date(UNIX_timestamp * 1000);
        return dateObject.toLocaleString()
    }


    constructor(props) {
        super(props)
        this.state = {
            account: '',
            contract: null,

        }
    }

    render() {
        return (
            <>
                <div className="container-fluid mt-5">
                    <h1>List of bonds</h1>
                    <div className="table-responsive mt-4">
                    <table className="table">
                    <thead className="thead-dark">
                        <tr>
                            <th>Details</th>
                            <th>Company</th>
                            <th>Project</th>
                            <th>Symbol</th>
                            <th>Status</th>
                            <th>Bidding</th>        
                            <th>Deadline</th>
                            <th>Your investement</th>                                    
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><Link to="/red">Details</Link></td>
                            <td>{this.state.company}</td>
                            <td>{this.state.project}</td>
                            <td>{this.state.symbol}</td>
                            <td>{this.state.status}</td>
                            {this.state.biddingOpen
                                ? <td className="text-success">Open</td>
                                : <td className="text-danger">Closed</td>
                            }   
                            <td>{this.state.bidClosingTime}</td>  
                            <td>{this.state.tokensOwned}</td>                   
                        </tr>
                        <tr>
                            <td><Link to="/yellow">Details</Link></td>
                            <td>{this.state.company4}</td>
                            <td>{this.state.project4}</td>
                            <td>{this.state.symbol4}</td>
                            <td>{this.state.status4}</td>
                            {this.state.biddingOpen4
                                ? <td className="text-success">Open</td>
                                : <td className="text-danger">Closed</td>
                            }   
                            <td>{this.state.bidClosingTime4}</td>
                            <td>{this.state.tokensOwned4}</td>   
                        </tr>
                        <tr>
                            <td><Link to="/blue">Details</Link></td>
                            <td>{this.state.company2}</td>
                            <td>{this.state.project2}</td>
                            <td>{this.state.symbol2}</td>
                            <td>{this.state.status2}</td>
                            {this.state.biddingOpen2
                                ? <td className="text-success">Open</td>
                                : <td className="text-danger">Closed</td>
                            }   
                            <td>{this.state.bidClosingTime2}</td> 
                            <td>{this.state.tokensOwned2}</td>    
                        </tr>
                        <tr>
                            <td><Link to="/purple">Details</Link></td>
                            <td>{this.state.company3}</td>
                            <td>{this.state.project3}</td>
                            <td>{this.state.symbol3}</td>
                            <td>{this.state.status3}</td>
                            {this.state.biddingOpen3
                                ? <td className="text-success">Open</td>
                                : <td className="text-danger">Closed</td>
                            }   
                            <td>{this.state.bidClosingTime3}</td>
                            <td>{this.state.tokensOwned3}</td>   
                        </tr>
                    </tbody>
                    </table>
                    </div>  
                </div>
                <hr />
            </>


        );
    }
}
export default BondList;
