import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';

// Bond details
import YellowBOnd from '../components/yellow';

// Button back
import ButtonBack from '../components/backToBondList';

class Yellow extends Component {

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
                <div className="container-fluid mt-5 px-5">
					<ButtonBack />
					<h2 className="mt-3">Bond Details</h2>
				</div>
				<YellowBOnd />
				


				<div className="container-fluid mt-5 px-5">	
					<h2>Links</h2>
					<ul>
						<li><Link to="/buyyellow">Investor Page</Link></li>
						<li><Link to="/issueryellow">Issuer Page</Link></li>
						<li><Link to="/companyyellow">Company Page</Link></li>
						<li><Link to='/regulatoryellow'>Regulator Page</Link></li>
					</ul>
				</div>


			</>
		);
	}
}

export default Yellow;
