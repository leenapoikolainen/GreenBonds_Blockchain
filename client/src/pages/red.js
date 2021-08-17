import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';

// Bond details
import RedBond from '../components/red';

// Button back
import ButtonBack from '../components/backToBondList';

class Red extends Component {

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
					<h2 className="mt-3">Bond Details:</h2>
				</div>
				<RedBond />

				<div className="container-fluid mt-5 px-5">	
					<h2>Links: </h2>
					<ul>
						<li><Link to="/buyred">Investor Page</Link></li>
						<li><Link to="/issuerred">Issuer Page</Link></li>
						<li><Link to="/companyred">Company Page</Link></li>
						<li><Link to='/regulatorred'>Regulator Page</Link></li>
					</ul>
				</div>


			</>
		);
	}
}

export default Red;
