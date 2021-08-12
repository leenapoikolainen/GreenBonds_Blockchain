import logo from './logo.svg';
import './App.css';
import React, { Component, useState } from 'react';
import Navbar from './components/Navbar/index';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

// Pages
import About from './pages/about';
import BuyBonds from './pages/buybonds';
import Company from './pages/company';
import Issuer from './pages/issuer';
import Investor from './pages/investor';
import BondList from './pages/bondlist';
import Regulation from './pages/regulation';
import Certifier from './pages/certificate';
import Verifier from './pages/verifier';
import VerificationRepo from './pages/verificationRepo';
import Blue from './pages/blue';
import BlueBuy from './pages/blueBuy';
import BlueIssuer from './pages/blueIssuer';


// import Navbar from './components/Navbar';

import 'bootstrap/dist/css/bootstrap.min.css';



class App extends Component {
  
  constructor(props) {
    super(props)
    this.state = {    
    }
  }

  render() {
    return (
      <>
        <Router>
          <div>
            <Navbar />
            <div className="container-fluid mt-5"></div>
         
            <Switch>
              <Route path='/' exact component={About} />
              <Route path='/about' component={About} />
              <Route path='/buybonds' component={BuyBonds} />
              <Route path='/investor' component={Investor} />
              <Route path='/bondlist' component={BondList} />
              <Route path='/issuer' component={Issuer}/>
              <Route path='/company' component={Company}/>
              <Route path='/regulation' component={Regulation}/>
              <Route path='/certifier' component={Certifier}/>
              <Route path='/verifier' component={Verifier}/>
              <Route path='/verification' component={VerificationRepo}/>
              <Route path='/blue' component={Blue}/>
              <Route path='/buyblue' component={BlueBuy}/>
              <Route path='/issuerblue' component={BlueIssuer}/>
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
