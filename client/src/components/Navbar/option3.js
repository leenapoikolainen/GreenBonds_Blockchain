import React, { Component, useState } from 'react';
import Web3 from 'web3';

import {
    Navbar,
    Container,
    Nav,
} from 'react-bootstrap'

class Option3 extends Component {
    async componentWillMount() {
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
        
                <Navbar.Brand href="/">Green Bonds</Navbar.Brand>
                <Navbar.Brand className=""><small>Logged in as: <br />{this.state.account}</small></Navbar.Brand>
                
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="/about">About</Nav.Link>
                            <Nav.Link href="/certifier">Certificates</Nav.Link>
                            <Nav.Link href="/verifications">Verifications</Nav.Link>
                            <Nav.Link href="/bondlist">Bond List</Nav.Link>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        );
    }

}

export default Option3;