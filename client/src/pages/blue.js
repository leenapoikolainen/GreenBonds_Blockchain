import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import BlueBond from '../components/blue';



class Blue extends Component {

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
					<h2>Bond Details</h2>
				</div>
				<BlueBond />


				<div className="container-fluid mt-5 px-5">	
					<h2>Links</h2>
					<ul>
						<li><Link to="/buyblue">Investor Page</Link></li>
						<li><Link to="/issuerblue">Issuer Page</Link></li>
						<li><Link to="">Company Page</Link></li>
						<li><Link to="">Regulator Page</Link></li>
					</ul>
				</div>

				
					
				


			</>
		);
	}
}

export default Blue;
