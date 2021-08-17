import React, { Component } from 'react';
import Web3 from 'web3'

// Import smart Contracts
import GreenBond from '../contracts/GreenBond2.json'

class RedDetails extends Component {

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
			const company = await greenBond.methods.getCompany().call()
			this.setState({ company })

			const project = await greenBond.methods.name().call()
			this.setState({ project })

			const symbol = await greenBond.methods.symbol().call()
			this.setState({ symbol })

			const minCoupon = await greenBond.methods.getMinCoupon().call()
			this.setState({ minCoupon })

			const maxCoupon = await greenBond.methods.getMaxCoupon().call()
			this.setState({ maxCoupon })

			const numberOfBondsSeeked = await greenBond.methods.getNumberOfBondsSought().call()
			this.setState({ numberOfBondsSeeked })

			const bidClosingTimeStamp = await greenBond.methods.getBidClosingTime().call()
			const bidClosingTime = this.timeConverter(bidClosingTimeStamp)
			this.setState({ bidClosingTime })

			const issueDateTimeStamp = await greenBond.methods.getIssueDate().call()
			const issueDate = this.timeConverter(issueDateTimeStamp)
			this.setState({ issueDate })

			const URI = await greenBond.methods.getBaseURI().call()
			this.setState({ URI })


			// Bidding open
			const timeNow = Date.now()
			let biddingOpen
			if (timeNow / 1000 - bidClosingTimeStamp > 0) {
				biddingOpen = false
			} else {
				biddingOpen = true
			}
			this.setState({ biddingOpen })

			let couponDates = await greenBond.methods.getCouponDates().call()
			const couponList = couponDates.map((date) =>
				<li>{this.timeConverter(date)}</li>
			);
			this.setState({ couponList })

			const term = await greenBond.methods.getTerm().call()
			this.setState({ term })

			const maturityDateTimeStamp = await greenBond.methods.getMaturityDate().call()
			const maturityDate = this.timeConverter(maturityDateTimeStamp)
			this.setState({ maturityDate })

			// Coupon status
			const confirmed = await greenBond.methods.couponDefined().call()
			this.setState({ confirmed })

			const coupon = await greenBond.methods.getCouponDates().call()
			this.setState({ coupon })

		} else {
			window.alert('Smart contract not deployed to detected network.')
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
		}
	}

	render() {
		return (

			<div className="row">
				<div className="container mr-auto ml-auto mt-4">
					{this.state.biddingOpen
						? <div className="alert alert-success" role="alert">
							Bidding for this bond is open.
						</div>
						: <div className="alert alert-danger" role="alert">
							Bidding for this bond is closed.
						</div>
					}
				</div>
				<div className="container mr-auto ml-auto">
					<table className="table mt-4">
						<tr>
							<td>Company</td>
							<td>{this.state.company}</td>
						</tr>
						<tr>
							<td>Project</td>
							<td>{this.state.project}</td>
						</tr>
						<tr>
							<td>Symbol</td>
							<td>{this.state.symbol}</td>
						</tr>
						<tr>
							<td>Coupon range</td>
							<td>{this.state.minCoupon} - {this.state.maxCoupon}</td>
						</tr>
						<tr>
							<td>Number of Bonds Sought</td>
							<td>{this.state.numberOfBondsSeeked}</td>
						</tr>
						<tr>
							<td>Bid Closing time</td>
							<td>{this.state.bidClosingTime}</td>
						</tr>
						<tr>
							<td>Issue date</td>
							<td>{this.state.issueDate}</td>
						</tr>
						<tr>
							<td>Term</td>
							<td>{this.state.term} year</td>
						</tr>
						<tr>
							<td>Maturity Date</td>
							<td>{this.state.maturityDate}</td>
						</tr>
						<tr>
							<td>More details</td>
							<td>{this.state.URI}</td>
						</tr>
						<tr>
							<td>Coupon</td>
							{this.state.confirmed 
								? <td>{this.state.coupon}</td>
								: <td><i>Not confirmed</i></td>
							}
						</tr>
					</table>
					<p><b>Coupon Dates:</b></p>
					<ul>{this.state.couponList}</ul>
				</div>
			</div>


		);
	}
}

export default RedDetails;
