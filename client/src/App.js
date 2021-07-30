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
import Investor2 from './pages/investor2';
import Regulation from './pages/regulation';
import Certifier from './pages/certificate';


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
              <Route path='/bondlist' component={Investor2} />
              <Route path='/issuetokens' component={IssueTokens}></Route>
              <Route path='/issuer' component={Issuer}/>
              <Route path='/company' component={Company}/>
              <Route path='/regulation' component={Regulation}/>
              <Route path='/certifier' component={Certifier}/>
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
