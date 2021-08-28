import React, { Component } from 'react';

// Bond details
import Bond from '../../components/Yellow/yellow';

// Button back
import ButtonBack from '../../components/backToBondList';

// Pagination
import Pagination from '../../components/Yellow/pagination';

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
				<main className="mb-5">
					<div className="container-fluid mt-5 px-5">
						<ButtonBack />
						<Pagination />
						<h2 className="mt-3">Bond Details:</h2>
					</div>
					<Bond />
				</main>
			</>
		);
	}
}

export default Yellow;
