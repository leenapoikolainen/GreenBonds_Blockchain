import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond.json';

class Company extends Component {
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
            const name = await greenBond.methods.getName().call()
            this.setState({ name })

            const symbol = await greenBond.methods.symbol().call()
            this.setState({ symbol })

            const company = await greenBond.methods.getCompany().call()
            this.setState({ company })

            const faceValue = await greenBond.methods.getFaceValue().call()
            this.setState({ faceValue })

            const minCoupon = await greenBond.methods.getMinCoupon().call()
            this.setState({ minCoupon })

            const maxCoupon = await greenBond.methods.getMaxCoupon().call()
            this.setState({ maxCoupon })

            const bidClosingTimeTimeStamp = await greenBond.methods.getBidClosingTime().call()
            const bidClosingTime = this.timeConverter(bidClosingTimeTimeStamp)
            this.setState({ bidClosingTime })

            const term = await greenBond.methods.getTerm().call()
            this.setState({ term })

            const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
            const maturityDate = this.timeConverterDateYear(maturityDateTimeStamp)
            this.setState({ maturityDate })

            let couponDates = await greenBond.methods.getCouponDates().call()
            const couponList = couponDates.map((date) =>
                <li>{this.timeConverterDateYear(date)}</li>
            );
            this.setState({ couponList })
            /*
            for(var i = 0; i < couponDates.length; i++) {
                const timeStamp = couponDates[i]
                const date = this.timeConverter(timeStamp)
                this.setState({
                    couponPaymentDates: [...this.state.couponPaymentDates, date]
                })
            }
            */
        
        
        } else {
        window.alert('Smart contract not deployed to detected network.')
        }
    }

    timeConverter(UNIX_timestamp){
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        if(min < 10) {
            return (date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + '0')
        } else {
            return (date + ' ' + month + ' ' + year + ' ' + hour + ':' + min);
        }
        
        
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
			contract: null,
            couponPaymentDates: [],
		}
	}

    render() {
        return (
            <>
            <div className="container-fluid mt-5">
                 <h1>Bond Details</h1>
                 <p>Company: {this.state.company}</p>
                 <p>Project Name: {this.state.name}</p>
                 <p>Symbol: {this.state.symbol}</p>
                 <p>Face value: {this.state.faceValue}</p>
                 <p>Min Coupon: {this.state.minCoupon}</p>
                 <p>Max Coupon: {this.state.maxCoupon}</p>
                 <p>Number of Bonds seeked: </p>
                 <p>Bid closing time: {this.state.bidClosingTime}</p>
                 <p>Term: {this.state.term} years</p>
                 <p>Maturity Date: {this.state.maturityDate}</p>
                 <p>Coupon Payment Dates:</p>
                <ul>{this.state.couponList}</ul>
            </div>
            </>
           
        );
    }
}

export default Company;