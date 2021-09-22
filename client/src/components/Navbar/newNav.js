import React, { Component } from 'react';
import Web3 from 'web3';

import {
    Navbar,
    Container,
    Nav,
    NavDropdown
} from 'react-bootstrap'

import { Link } from "react-router-dom";

class Option3 extends Component {
    async componentDidMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()

    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
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
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',

        }
    }

    render() {
        return (
            <Navbar bg="info" variant="dark" expand="lg" sticky="top">
        
                <Navbar.Brand className="font-weight-bold">Green Bonds</Navbar.Brand>
                <Navbar.Brand className="font-italic"><small>Logged in as: <br />{this.state.account}</small></Navbar.Brand>
                
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Link 
                                className="text-white font-weight-bold mr-4 py-2 text-uppercase"
                                to="/about">About</Link>
                            <Link 
                                className="text-white font-weight-bold mr-4 py-2 text-uppercase"
                                to="/certifier">Certificates</Link>
                            <Link 
                                className="text-white font-weight-bold mr-4 py-2 text-uppercase"
                                to="/verifications">Verifications</Link>

                            <NavDropdown title="BOND LIST" id="bond-dropdown" className="text-white font-weight-bold text-uppercase">
                                <NavDropdown.Item>
                                    <Link className="text-uppercase text-info" to="/bondlist">See All</Link>
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item>
                                    <Link className="text-uppercase text-info" to="/red">Red</Link>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                    <Link className="text-uppercase text-info" to="/yellow">Yellow</Link>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                    <Link className="text-uppercase text-info" to="/blue">Blue</Link>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                    <Link className="text-uppercase text-info" to="/purple">Purple</Link>
                                </NavDropdown.Item>
                                <NavDropdown.Item>
                                    <Link className="text-uppercase text-info" to="/white">White</Link>
                                </NavDropdown.Item>
                            </NavDropdown>
                            {/*
                            <Nav.Link href="/about">About</Nav.Link>
                            <Nav.Link href="/certifier">Certificates</Nav.Link>
                            <Nav.Link href="/verifications">Verifications</Nav.Link>
                            <Nav.Link href="/bondlist">Bond List</Nav.Link>
                            */}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }

}

export default Option3;