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

			console.log("Bond", greenBond)

			// Number of investors
			const numberOfInvestors = await greenBond.methods.numberOfInvestors().call()
			this.setState({ numberOfInvestors })

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

			// Testing a function call
			const name = await greenBond.methods.getName().call()
			this.setState({ name })
			console.log(name)

			// Testing mapping 
			const account = accounts[0];
			const balance = await greenBond.methods.getInvestorBalance(account).call()
			this.setState({ balance })
			console.log("Balance", balance)

			const value = await greenBond.methods.getValue().call()
			console.log("Value", value)
			const numberOfTokens = balance / value;
			console.log("Tokens", numberOfTokens)
			this.setState({ numberOfTokens })

		} else {
			window.alert('Smart contract not deployed to detected network.')
		}
	}


	// Testing investing function
	invest = (numberOfTokens) => {
		var amount = (numberOfTokens * 100).toString();

		this.state.greenBond.methods.registerInvestment(numberOfTokens).send({ from: this.state.account, value: Web3.utils.toWei(amount, 'Wei') })
	}

	constructor(props) {
		super(props)
		this.state = {
			account: '',
			contract: null,
			numberOfInvestors: 0,
			investors: [],
			balances: [],
			balance: 0,
			numberOfTokens: 0,
			
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
						<h2>Your investments:</h2>
					</div>
					<div className="row text-center">
						<p>Tokens requested: {this.state.numberOfTokens}</p>
					</div>
					<div className="row text-center">
						<p>Invested amount: {this.state.balance}</p>
					</div>
					<hr />
					

				</main>
			</div >
		);
	}
};

export default BuyBonds;
