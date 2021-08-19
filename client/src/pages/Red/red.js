import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';

// Bond details
import RedBond from '../../components/red';

// Button back
import ButtonBack from '../../components/backToBondList';

import Pagination from '../../components/Red/pagination';

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
				<main className="mb-5">
					<div className="container-fluid mt-5 px-5">
						<ButtonBack />
						<Pagination />
						<h2 className="mt-3">Bond Details:</h2>
					</div>
					<RedBond />
				</main>
			</>
		);
	}
}

export default Red;
