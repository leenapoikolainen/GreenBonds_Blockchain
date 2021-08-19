import './App.css';
import React, { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';


// Navbar
import Navbar from './components/Navbar/option3';

// Pages
import About from './pages/about';

import CertificationRepo from './pages/certificationRepo';
import VerificationRepo from './pages/verificationRepo';

// Bond lists
import BondList from './pages/bondlist';
import BondListRopsten from './pages/bondlistRopsten';

// Pages for bond BLUE
import Blue from './pages/Blue/blue';
import BlueBuy from './pages/Blue/blueBuy';
import BlueIssuer from './pages/Blue/blueIssuer';
import BlueCompany from './pages/Blue/blueCompany';
import BlueRegulator from './pages/Blue/blueRegulator';

// Pages for bond BLUE
import Purple from './pages/Purple/purple';
import PurpleBuy from './pages/Purple/purpleBuy';
import PurpleIssuer from './pages/Purple/purpleIssuer';
import PurpleCompany from './pages/Purple/purpleCompany';
import PurpleRegulator from './pages/Purple/purpleRegulator';

// Pages for bond RED
import Red from './pages/Red/red';
import RedBuy from './pages/Red/redBuy'
import RedIssuer from './pages/Red/redIssuer';
import RedCompany from './pages/Red/redCompany';
import RedRegulator from './pages/Red/redRegulator';


// Pages for bond YELLOW
import Yellow from './pages/yellow';
import YellowBuy from './pages/yellowBuy';
import YellowIssuer from './pages/yellowIssuer';
import YellowCompany from './pages/yellowCompany';
import YellowRegulator from './pages/yellowRegulator';


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
              {/* Default path */}
              <Route path='/' exact component={About} />

              <Route path='/about' component={About} />      
              <Route path='/certifier' component={CertificationRepo} />
              <Route path='/verifications' component={VerificationRepo} />

              <Route path='/bondlist' component={BondList} />
              <Route path='/bondlist2' component={BondListRopsten} />

              <Route path='/blue' component={Blue} />
              <Route path='/buyblue' component={BlueBuy} />
              <Route path='/issuerblue' component={BlueIssuer} />
              <Route path='/companyblue' component={BlueCompany} />
              <Route path='/regulatorblue' component={BlueRegulator} />

              <Route path='/purple' component={Purple} />
              <Route path='/buypurple' component={PurpleBuy} />
              <Route path='/issuerpurple' component={PurpleIssuer} />
              <Route path='/companypurple' component={PurpleCompany} />
              <Route path='/regulatorpurple' component={PurpleRegulator} />

              <Route path='/red' component={Red} />
              <Route path='/buyred' component={RedBuy} />
              <Route path='/issuerred' component={RedIssuer} />
              <Route path='/companyred' component={RedCompany} />
              <Route path='/regulatorred' component={RedRegulator} />

              <Route path='/yellow' component={Yellow} />
              <Route path='/buyyellow' component={YellowBuy} />
              <Route path='/issueryellow' component={YellowIssuer} />
              <Route path='/companyyellow' component={YellowCompany} />
              <Route path='/regulatoryellow' component={YellowRegulator} />

            </Switch>
          </div>
        </Router>
      </>
    );
  }
}

export default App;
