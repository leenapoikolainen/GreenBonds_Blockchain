<p align="center"> 
  <h3 align="center">Project Documentation</h3>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#about-the-project">Overview</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#deployment">Deployment steps</a></li>
      </ul>
    </li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

This project focused on building a proof-of-concept platform to accomodate blockchain-based green bond issuance.
The backend consists of smart contracts deployed on the blockchain ledger (local Ganache blockchain and public Ropsten testnet), and there is a simple UI to allow user interaction with the smart contracts.

The goal was to evaluate how blockchain technology can improve the green bond issuance by enhancing transparency, increasing trust and reducing costs.

The platform supports three types of smart contracts
* Green Certification smart contract for green validation
* Green verifications smart contract for tracking the green KPI achievements
* Green Bond smart contract to automate and improve the issuance process


### Built With

* [Ethereum](https://ethereum.org/en/)
* [Solidity](https://docs.soliditylang.org/)
* [React](https://reactjs.org/)

<!-- GETTING STARTED -->
## Getting Started


### Prerequisites

This is an example of how to list things you need to use the software and how to install them.
* npm
  ```sh
  npm install npm@latest -g

* truffle
  ```sh
  npm install -g truffle

* OpenZeppelin contracts
    ```sh
    npm install @openzeppelin/contracts

* truffle/hdwallet-provider
  - Use it to sign transactions for addresses derived
  ```sh
  npm install @truffle/hdwallet-provider

* Metamask: Download from: https://metamask.io/download
  - Create your metamaks account to deploy contracts to the public testnet

* Infura Node Service: https://infura.io/ 
  - Public node service to connect to Ethereum blockchain. You need to create your own project to add to the configuration details.

### Deployment


1. Install NPM packages
   ```sh
   npm install
   ```
2. Install truffle
   ```sh
   npm install -g truffle
   ```
   
3. Add your own MetaMask and Infura Project Id details
   - Create secret.json file to the root folder
   - Add two data points: "mnemonic" and "projectId"

4. Install HD-wallet provider
   ```sh
   npm install @truffle/hdwallet-provider
   ```
   
   
5. Run Tests
   * You need time traveling plugin for tests to work. Install:
   ```sh
   npm i ganache-time-traveler
   ```
   * Then run:
   ```sh
   npx truffle test
   ```
4. Deploy contracts to local Ganache blockchain
   * Go to file migrations/2_deploy.js and edit the contract details
   * Remove comments after 'DEPLOYMENT TO GANACHE' (leave Ropsten deployment commented as you need to setup own Ethereum wallet and Blockchain node details for that)
   * Run:
    ```sh
   npx truffle migrate --reset
   ```
5. Start UI
   * Install web3.js library
   ```sh
    npm install web3
   ```
   * Start the application
    ```sh
    cd client
    npm run start
    ```


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Dapp University Tutorials](https://www.dappuniversity.com/)
* [OpenZeppelin Library](https://openzeppelin.com/)
