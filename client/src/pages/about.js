import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';

const About = () => {

	return (
		<div className="container-fluid my-5 px-5">
			<h1 className="text-center">Platform for Green Bond Issuance</h1>
			<div className="container-fluid mt-5 col-lg-10 col-xl-8 bg-light px-4 py-4">
				<h2>Purpose</h2>
				<p>
					This platform is a proof-of-concept that enables green bond issuance on blockchain.
					It is specifically build for sustainable building sector, where companies that fulfil
					the sector-specific requirements can access the green bond financing.
				</p>
				<p>
					<b>The platform supports the following:</b>
				</p>
				<ul>
					<li>
						Green Certifier can deploy blockchain-based green certificates, that
						ensure that the company and project they are financing with the green bond
						fulfil the green criteria for sustainable building. Anyone can query the 
						certificates.
					</li>
					<li>
						Green Verifier can calculate the companys performance against the specified KPIs
						and record the result on a green verification contract deployed on blockchain.
						Anyone can query the verification results.
					</li>
					<li>
						Anyone can see the list of green bonds deployed on the blockchain and
						inspect their key properties.
					</li>
					<ul>
						<li>
							Investors can place bids on available green bonds they would like to invest in,
							and see their bid / investment details.
						</li>
						<li>
							The issuer (financial institution) can define the coupon after bidding window is
							closed and create the bond issue.
						</li>
						<li>
							The issuer (financial institution) can adjust the coupon payment
							based on the verification result.
						</li>
						<li>
							The borrowing company can make coupon payments and pay back the principal.
						</li>
						<li>
							Regulator can validate if the payments have been made on time.
						</li>
					</ul>
				</ul>

			</div>

		</div>
	);
};

export default About;
