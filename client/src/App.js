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
    //await this.loadWeb3()
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

    const networkId = await web3.eth.net.getId()

  }

  constructor(props) {
    super(props)
    this.state = { account: '' }
  }
 
  render() {
    return (
      <>
      <Router>
        <div>
          <Navbar/>
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
