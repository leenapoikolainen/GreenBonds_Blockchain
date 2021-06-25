import React, { Component, useState } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond.json';

class IssueTokens extends Component {

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

            // Token count
            const tokens = await greenBond.methods.tokenCount().call()
            this.setState({ tokens })
            console.log("Number of tokens issued", tokens)


		} else {
			window.alert('Smart contract not deployed to detected network.')
		}
	}

    // Issuing function
    issue = () => {
        this.state.greenBond.methods.issueTokens().send({from: this.state.account})
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
        }
      }

    
    render() {
        return (
            <>
            <div className="container mr-auto ml-auto">
                <h1>Issue Tokens</h1>
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

export default IssueTokens;