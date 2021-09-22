import React from 'react';
import KeyPlayers from '../assets/key_players.png'
import PageStructure from '../assets/page_structure.png'

const About = () => {

	return (
		<div className="container-fluid my-5 px-5">
			<h1 className="text-center">Platform for Green Bond Issuance</h1>
			<div className="container-fluid mt-5 col-lg-10 col-xl-8 bg-light px-4 py-4 border rounded">
				<h2>Purpose</h2>
				<p>
					This platform is a proof-of-concept that tests end-to-end green bond lifecycle on a public blockchain.
					For simplicity, the green KPIs are assumed to be same for all the bonds listed on the platform
					- e.g. all bonds focus on financing sustainable building and have the same targets.
				</p>
				<div className="mb-4">
					<h2>Key players and smart contracts:</h2>
					<img
						className="img-fluid"
						alt="key players"
						width="620" height="350"
						src={KeyPlayers}
					/>
				</div>

				<div>
					<h2>The platform supports the following:</h2>
					<ul>
						<li>
							Green Certifier can deploy blockchain-based green certificates, that
							ensure the project that is being with a green bond
							fulfils the green criteria. Anyone can query the certificates.
						</li>
						<li>
							Green Verifier can calculate the companys performance against the specified KPIs
							and record the result on a green verification contract.
							Anyone can query the verification results.
						</li>
						<li>
							Anyone can see the list of green bond smart contracts deployed on the blockchain and
							inspect their key properties.
						</li>
						<ul>
							<li>
								Investors can place bids on available green bonds they would like to invest in,
								and see their bid / investment details. Bidding requires staking ether, which
								will be refunded if the bidder is not successful.
							</li>
							<li>
								The issuing institution can define the coupon after bidding window is
								closed (coupon will be automatically defined based a Dutch Auction),
								and create the bond issue if there was enough demand.
							</li>
							<li>
								The issuing institution can adjust the coupon payment
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

				<div className="mb-4"> 
					<h2>Page Structure</h2>
					<img
						className="img-fluid"
						alt="key players"
						width="620" height="350"
						src={PageStructure}
					/>
				</div>
				<div>
					<h2>Smart contract interaction:</h2>
					<p>
						The platform supports smart contracts deployed on a local Ganache blockchain
						network and on the public Ropsten testnet. Interacting with the smart contracts
						happens through MetaMask browser extension.
					</p>
				</div>
				

			</div>

		</div>
	);
};

export default About;
