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
      // Get the Green bond contract
      const greenBond = new web3.eth.Contract(GreenBond.abi, networkData.address)
      this.setState({ greenBond })

      console.log("Bond", greenBond)
      // There I would need to load anything I want to list
    
      // Testing a function call
      const name = await greenBond.methods.name().call()
      this.setState({ name })
      console.log(name)
      
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }

  // Testing investing function
  invest = (numberOfTokens) => {
    this.state.greenBond.methods.registerInvestment(numberOfTokens).send({from: this.state.account})
  }

  constructor(props) {
    super(props)
    this.state = { 
      account: '',
     }
  }
 
  render() {
    return (
      <>
      <Router>
        <div>
          <Navbar/>
          <div className="container-fluid mt-5">
            
            <h1>This is the common text part</h1>
            
            
            <p>Your account: {this.state.account}</p>
            <p>Contract Name: {this.state.name}</p>
            <div className="row">
              <main role="main" className="col-lg-12 d-flex text-center">
                <div className="content mr-auto ml-auto">
                  <h2>Invest</h2>
                  <form onSubmit={(event) => {
                    event.preventDefault()
                    const number = this.number.value
                    this.invest(number)
                  }}>
                  <input
                    type='number'
                    className='form-control mb-1'
                    // TESTING THIS
                    ref={(input) => {this.number = input}}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='INVEST'
                  />
                  </form>
                </div>
              </main>
            </div>
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
