import React, { Component, useState } from 'react';
import { Link } from 'react-router-dom';
import Web3 from 'web3'

import {
    Nav,
    NavLink,
    Bars,
    NavMenu,
    NavBtn,
    NavBtnLink,
} from './NavbarElements';



class Option2 extends Component {
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
            <>
                <Nav>
                    <Bars />
                    <NavMenu>
                        <NavLink to='/about' activeStyle>
                            About
                        </NavLink>
                        <NavLink to='/bondlist' activeStyle>
                            Private network bonds
                        </NavLink>
                        <NavLink to='/bondlist2' activeStyle>
                            Ropsten Bonds
                        </NavLink>
                        <NavLink to='/certifier' activeStyle>
                            Certificates
                        </NavLink>
                        <NavLink to='/verifications' activeStyle>
                            Verifications
                        </NavLink>
                       
                        <NavBtn>User: {this.state.account}</NavBtn>
                       
                    </NavMenu>
                </Nav>

            </>
        );
    }
}
export default Option2;