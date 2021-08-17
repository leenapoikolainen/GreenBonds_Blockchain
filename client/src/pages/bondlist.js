import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3';

import GreenBond from '../contracts/GreenBond2.json';
import GreenBond2 from '../contracts/GreenBond3.json';
import BondPurple from '../contracts/BondPurple.json';


class BondList extends Component {
    async componentWillMount() {
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
        const networkData = GreenBond.networks[networkId]
        const networkData2 = GreenBond2.networks[networkId]
        const networkData3 = BondPurple.networks[networkId]

        if (networkData) {
            // Get the Green bond contract
            const greenBond = new web3.eth.Contract(GreenBond.abi, networkData.address)
            this.setState({ greenBond })

            const company = await greenBond.methods.getCompany().call()
            this.setState({ company })

            const project = await greenBond.methods.name().call()
            this.setState({ project })

            const symbol = await greenBond.methods.symbol().call()
            this.setState({ symbol })


            const bidClosingTimeStamp = await greenBond.methods.getBidClosingTime().call()
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

            const coupon = await greenBond.methods.getCoupon().call()
            this.setState({ coupon })

            const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
            const maturityDate = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate })

            const cancelled = await greenBond.methods.cancelled().call()
            const confirmed = await greenBond.methods.couponDefined().call()
            
            const tokens = await greenBond.methods.bondCount().call()
            this.setState({ tokens })

            if (cancelled) {
                const status = "Cancelled"
                this.setState({ status })
            } else if (!confirmed) {
                const status = "Unconfirmed"
                this.setStatus({ status })
            } else if (tokens > 0) {
                const status = "Active"
                this.setState({ status })
            } else {
                const status = "Matured"
                this.setState({ status })
            }

        } else {
            window.alert('Smart contract not deployed to detected network.')
        }

        if (networkData2) {
            // Get the Green bond contract
            const greenBond2 = new web3.eth.Contract(GreenBond2.abi, networkData2.address)
            this.setState({ greenBond2 })

            // First bond
            const company2 = await greenBond2.methods.getCompany().call()
            this.setState({ company2 })

            const project2 = await greenBond2.methods.name().call()
            this.setState({ project2 })

            const symbol2 = await greenBond2.methods.symbol().call()
            this.setState({ symbol2 })

            const bidClosingTimeStamp2 = await greenBond2.methods.getBidClosingTime().call()
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

            const coupon2 = await greenBond2.methods.getCoupon().call()
            this.setState({ coupon2 })

            const maturityDateTimeStamp = await greenBond2.methods.getMaturityDate().call()
            const maturityDate2 = this.timeConverter(maturityDateTimeStamp)
            this.setState({ maturityDate2 })

            const cancelled = await greenBond2.methods.cancelled().call()
            const confirmed = await greenBond2.methods.couponDefined().call()

            if (cancelled) {
                const status2 = "Cancelled"
                this.setState({ status2 })
            } else if (confirmed) {
                const status2 = "Confirmed"
                this.setState({ status2 })
            } else {
                const status2 = "Unconfirmed"
                this.setState({ status2 })
            }
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
            

            if (cancelled) {
                const status3 = "Cancelled"
                this.setState({ status3 })
            } else if (confirmed) {
                const status3 = "Confirmed"
                this.setState({ status3 })
            } else {
                const status3 = "Unconfirmed"
                this.setState({ status3 })
            }
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
