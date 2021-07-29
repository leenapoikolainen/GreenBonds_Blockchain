import React, { Component, useState } from 'react';
import Web3 from 'web3';

import GreenBond from '../contracts/GreenBond.json';

class Investor extends Component {
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
            
            // First bond
            const company = await greenBond.methods.getCompany().call()
            this.setState({ company })

            const project = await greenBond.methods.getName().call()
            this.setState({ project })

            const open = await greenBond.methods.biddingWindowisOpen().call()
            if(open) {
                const status = "Open";
                this.setState({ status })
            } else {
                const status = "Closed";
                this.setState({ status })
            }
            

            const coupon = await greenBond.methods.getCoupon().call()
            this.setState({ coupon })

            const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
            const maturityDate = this.timeConverterDateYear(maturityDateTimeStamp)
            this.setState({ maturityDate })

            const etherscanAddress = "https://ropsten.etherscan.io/address/0xD166D1353b6e3603f3C6a6EBCdb79365C2231D6e";
            this.setState({ etherscanAddress })

        } else {
            window.alert('Smart contract not deployed to detected network.')
        }
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
            contract: null,
            
        }
    }

    render() {
        return (
            <>
                <div className="container-fluid mt-5">
                    <h1>Bond List</h1>
                    <table className="table">
                    <tr>
                        <th>Company</th>
                        <th>Project</th>
                        <th>Open for bids</th>
                        <th>Coupon</th>
                        <th>Maturity</th>
                        <th>Link to Etherscan</th>
                    </tr>
                    <tr>
                        <td>{this.state.company}</td>
                        <td>{this.state.project}</td>
                        <td>{this.state.status}</td>
                        <td>{this.state.coupon}</td>
                        <td>{this.state.maturityDate}</td>
                        <td><a href={this.state.etherscanAddress}>Link</a></td>
                    </tr>
                    </table>
                    
                </div>
                <hr />
               
            </>


        );
    }
}
export default Investor;
