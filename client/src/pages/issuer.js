import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond.json';

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

            // Get time
            let d = new Date()
            let time = d.getTime()
            let date = this.timeConverter(time)
            this.setState({date})

            // bid closing time
            const bidClosingTimeTimeStamp = await greenBond.methods.getBidClosingTime().call()
            const bidClosingTime = this.timeConverter2(bidClosingTimeTimeStamp)
            this.setState({ bidClosingTime })

            // Bidding open
            let biddingOpen = true;
            if (bidClosingTimeTimeStamp * 1000  < time) {
                biddingOpen = false;
            }
            this.setState({ biddingOpen })

            // Coupon
            const coupon = await greenBond.methods.getCoupon().call()
            this.setState({ coupon })

			// Number of investors
			const numberOfInvestors = await greenBond.methods.numberOfInvestors().call()
			this.setState({ numberOfInvestors })

            // IssueDate
            const issueDateTimeStamp = await greenBond.methods.getIssueDate().call()
            const issueDate = this.timeConverterDateYear(issueDateTimeStamp)
            this.setState({ issueDate })
 
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
            
            


		} else {
			window.alert('Smart contract not deployed to detected network.')
		}
	}

    // Issuing function
    issue = () => {
        this.state.greenBond.methods.issueBonds().send({from: this.state.account})
    }

    defineCoupon = () => {
        this.state.greenBond.methods.defineCoupon().send({from: this.state.account})
    }


    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var seconds = a.getSeconds();
        
        return (date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + seconds); 
    }

    timeConverter2(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var seconds = a.getSeconds();
        
        return (date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + seconds);
        
    }

    timeConverterDateYear(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
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
        }
      }

    
    render() {
        return (
            <>
            <div className="container mr-auto ml-auto">
                <p>Time now: {this.state.date}</p>
                <p>Bid closing time: {this.state.bidClosingTime}</p>
                <p>Bidding is <b>{this.state.biddingOpen ? 'open' : 'closed'}</b></p>
                <h2>Define Coupon</h2>
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
                <hr/>
                {this.state.coupon == 0 
                    ? <p>Coupon not defined</p> 
                    : <p>Coupon defined: {this.state.coupon}</p>
                }
                
            </div>
            <hr/>
            <div className="container mr-auto ml-auto">
                <h2>Number of investors</h2>
                <p>Number: {this.state.numberOfInvestors}</p>
            </div>
            <hr/>
            <div className="container mr-auto ml-auto">
                <h2>Issue Tokens</h2>
                <p>Issue Date: {this.state.issueDate}</p>

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
            <hr/>
            <div className="container mr-auto ml-auto">
                <p>Number of tokens issued: {this.state.tokens}</p>
            </div>
            
            
            
            
            </>
        )
    }
};

export default Issuer;