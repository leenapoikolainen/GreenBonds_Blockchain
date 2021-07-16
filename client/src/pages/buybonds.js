import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond.json';

class BuyBonds extends Component {

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
			// For testing - print details on console
			console.log("Bond", greenBond)


			// Getting investor details 
			const account = accounts[0];
			const balance = await greenBond.methods.getInvestorBalance(account).call()
			this.setState({ balance })
			// For testing - print details on console
			console.log("Balance", balance)

			const value = await greenBond.methods.getFaceValue().call()
			console.log("Value", value)
			const numberOfTokens = balance / value;
			console.log("Tokens", numberOfTokens)
			this.setState({ numberOfTokens })

			// Balance of test
			const tokensOwned = await greenBond.methods.balanceOf(account).call()
			console.log("Tokens owned", tokensOwned)
			this.setState({ tokensOwned })

		} else {
			window.alert('Smart contract not deployed to detected network.')
		}
	}


	// Testing investing function
	invest = (numberOfTokens) => {
		var amount = (numberOfTokens * 100).toString();
		const receipt = this.state.greenBond.methods.registerInvestment(numberOfTokens).send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
		console.log(receipt.events.DataStored.raw)
	}

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			contract: null,
			numberOfInvestors: 0,
			investors: [],
			balance: 0,
			numberOfTokens: 0,
			tokensOwned: 0,
		}
	}

	render() {
		return (
			<div className="container-fluid mt-5">
				<main role="main" >
					<div className="row">
						<div className="container mr-auto ml-auto">
							<h2>Invest</h2>
							<form onSubmit={(event) => {
								event.preventDefault()
								const number = this.number.value
								this.invest(number)
							}}>
								<input
									type='number'
									className='form-control mb-1'
									min='0'
									ref={(input) => { this.number = input }}
								/>
								<input
									type='submit'
									className='btn btn-block btn-primary'
									value='INVEST'
								/>
							</form>
						</div>
					</div>
					<hr />
					<div className="row">
						<h2>Your investment request:</h2>
					</div>
					<div className="row text-center">
						<p>Tokens requested: {this.state.numberOfTokens}</p>
					</div>
					<div className="row text-center">
						<p>Investment balance: {this.state.balance}</p>
					</div>
					<hr />
					<div className="row">
						<h2>Tokens:</h2>
					</div>
					<div className="row text-center">
						<p>Tokens owned: {this.state.tokensOwned}</p>
					</div>
					

				</main>
			</div >
		);
	}
};

export default BuyBonds;
