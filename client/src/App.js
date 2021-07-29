import logo from './logo.svg';
import './App.css';
import React, { Component, useState } from 'react';
import Navbar from './components/Navbar/index';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Pages
import About from './pages/about';
import BuyBonds from './pages/buybonds';
import IssueTokens from './pages/issueTokens';
import Company from './pages/company';
import Issuer from './pages/issuer';
import Investor from './pages/investor';

import Test from './pages/test';

import Web3 from 'web3'


// import Navbar from './components/Navbar';

import 'bootstrap/dist/css/bootstrap.min.css';

// Import smart Contracts
import GreenBond from './contracts/GreenBond.json';

class App extends Component {
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

      console.log("Bond", greenBond)
    
      // Testing a function call
      const name = await greenBond.methods.getName().call()
      this.setState({ name })
      console.log(name)

      // Token count
      const tokens = await greenBond.methods.bondCount().call()
      this.setState({ tokens })
      console.log("Number of tokens issued", tokens)
      
      // Bond value and coupon
      const value = await greenBond.methods.getFaceValue().call()
      this.setState({ value })
      const coupon = await greenBond.methods.getCoupon().call()
      this.setState({ coupon })

    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  

  // Issuing function
  issue = () => {
    this.state.greenBond.methods.issueTokens().send({from: this.state.account})
    let tokens = this.state.greenBond.methods.tokenCount().call()
    this.setState({ tokens })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      numberOfInvestors: 1,
      investors: [],
      tokens: 0,
      value: 0,
      coupon: 0,
    }
  }

  render() {
    return (
      <>
        <Router>
          <div>
            <Navbar />
            <div className="container-fluid mt-5"></div>
            {/* 
            <div className="container-fluid mt-5">

              <h1>This is the common text part</h1>
              <p>Your account: {this.state.account}</p>
              <p>Contract Name: {this.state.name}</p>
              <p>Bond price: {this.state.value}</p>
              <p>Coupon: {this.state.coupon}</p>
                  
            </div>
            */}
                
            <Switch>
              <Route path='/' exact component={About} />
              <Route path='/about' component={About} />
              <Route path='/buybonds' component={BuyBonds} />
              <Route path='/investor' component={Investor} />
              <Route path='/issuetokens' component={IssueTokens}></Route>
              <Route path='/issuer' component={Issuer}/>
              <Route path='/company' component={Company}/>
            </Switch>
          </div>
        </Router>
      </>
    );
  }
}

export default App;
{/* 
function App() {
  return (
    <Router>
      <Navbar />
      <Switch>
        <Route path='/' exact component={About} />
        <Route path='/about' component={About} />
        <Route path='/buybonds' component={BuyBonds} />
      </Switch>
    </Router> 
  );
}

export default App;

*/}


{/* 
    <>
    <Navbar/>
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
    </>
    */}
