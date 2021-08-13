import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3'

// Import link button
import ButtonBack from '../components/backToBlue';

// Import smart Contracts
import GreenBond from '../contracts/GreenBond3.json';


class BuyBlue extends Component {

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
			
			// Bond details
			const symbol = await greenBond.methods.symbol().call()
			this.setState({ symbol })

			const bidClosingTimeStamp = await greenBond.methods.getBidClosingTime().call()
            const bidClosingTime = this.timeConverter(bidClosingTimeStamp)
            this.setState({ bidClosingTime })

			// Bidding open
			const timeNow = Date.now()
            let biddingOpen
            if(timeNow/1000 - bidClosingTimeStamp > 0) {
                biddingOpen = false
            } else {
                biddingOpen = true
            }
            this.setState({ biddingOpen })

			// Getting investor details 
			const account = accounts[0];

			const bondsRequested = await greenBond.methods.getRequestedBondsPerInvestor(account).call()
			this.setState({ bondsRequested  })

			const coupon = await greenBond.methods.getCouponPerInvestor(account).call()
			this.setState({ coupon })
			
			const balance = await greenBond.methods.getStakedAmountPerInvestor(account).call()
			this.setState({ balance })
			

			const value = await greenBond.methods.getFaceValue().call()
			console.log("Value", value)
			const numberOfTokens = balance / value;
			console.log("Tokens", numberOfTokens)
			this.setState({ numberOfTokens })

			// Balance of test
			const tokensOwned = await greenBond.methods.balanceOf(account).call()
			this.setState({ tokensOwned })

		} else {
			window.alert('Smart contract not deployed to detected network.')
		}
	}

	timeConverter(UNIX_timestamp) {
        var dateObject = new Date(UNIX_timestamp * 1000); 
        return dateObject.toLocaleString()  
    }

	// Testing investing function
	invest = (numberOfTokens) => {
		var amount = (numberOfTokens * 100).toString();
		const receipt = this.state.greenBond.methods.registerInvestment(numberOfTokens).send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
		console.log(receipt.events.DataStored.raw)
	}

	// Register bid function
	registerbid = (coupon, numberOfBonds) => {
		var amount = (numberOfBonds * 100).toString();
		this.state.greenBond.methods.registerBid(coupon, numberOfBonds).send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
		this.setState({ coupon })
		//console.log(receipt.events.DataStored.raw)
	}

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			contract: null,
			numberOfInvestors: 0,
			investors: [],
			balance: 0,
			bondsRequested: 0,
			numberOfTokens: 0,
			tokensOwned: 0,
			coupon: 0,
		}
	}

	render() {
		return (
			<div className="container-fluid mt-5">
                    <div className="container mr-auto ml-auto">
                        <h2>Bond: {this.state.symbol}</h2>
						<ButtonBack />
                    </div>
					<hr/>               

					<div className="row mt-4">
						<div className="container mr-auto ml-auto">
							<h2>Register Bid</h2>
							<form onSubmit={(event) => {
								event.preventDefault()
								const coupon = this.coupon.value
								const numberOfBonds = this.numberOfBonds.value
								this.registerbid(coupon, numberOfBonds)
							}}>
								<label for="coupon">Coupon</label>
								<input
									id='coupon'
									type='number'
									className='form-control mb-1'
									min='0'
									ref={(input) => { this.coupon = input }}
								/>
								<label for="numberOfBonds">Number Of Bonds</label>
								<input
									id='numberOfBonds'
									type='number'
									className='form-control mb-1'
									min='0'
									ref={(input) => { this.numberOfBonds = input }}
								/>
								<input
									type='submit'
									className='btn btn-block btn-primary mt-4'
									value='INVEST'
								/>
							</form>
						</div>
					</div>
					<hr />
					<div className="row">
						<div className="container mr-auto ml-auto">
							<h2 className="mb-4">Bid details:</h2>
							<p>Bonds requested: {this.state.bondsRequested}</p>
							<p>Coupon bid: {this.state.coupon}</p>
							<p>Staking balance: {this.state.balance}</p>
						</div>
						
					</div>
					
					
					<hr />
					<div className="row pb-5">
						<div className="container mr-auto ml-auto">
							<h2 className="mb-4">Investment Details:</h2>
							<p>Bonds owned: {this.state.tokensOwned}</p>
						</div>
					</div>
					
			</div >
		);
	}
}

export default BuyBlue;