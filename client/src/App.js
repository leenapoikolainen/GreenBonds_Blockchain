import logo from './logo.svg';
import './App.css';
import React, {Component, useState} from 'react';
import Navbar from './components/Navbar/index';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Pages
import About from './pages/about';
import BuyBonds from './pages/buybonds';
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
    if(networkData) {
      const abi = GreenBond.abi
      const address = networkData.address
      // Get the Green bond contract
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })

      console.log("Bond", contract)
      // There I would need to load anything I want to list
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  constructor(props) {
    super(props)
    this.state = { 
      account: '',
      testFigure: 0
     }
  }
 
  render() {
    return (
      <>
      <Router>
        <div>
          <Navbar/>
          <div>
            <h1>This is the common text part</h1>
            <p>Your account: {this.state.account}</p>
            <p>Your figure: {this.state.testFigure}</p>
          </div>
          
          <Switch>
            <Route path='/' exact component={About} />
            <Route path='/about' component={About} />
            <Route path='/buybonds' component={BuyBonds} />
            <Route path='/test' component={Test} />
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
