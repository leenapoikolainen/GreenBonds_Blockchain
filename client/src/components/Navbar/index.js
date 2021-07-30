import React, {useState} from 'react';
import {
Nav,
NavLink,
Bars,
NavMenu,
NavBtn,
NavBtnLink,
} from './NavbarElements';

const Navbar = () => {
    return (
        <>
        <Nav>     
            <Bars />

            <NavMenu>
                <NavLink to='/about' activeStyle>
                    About
                </NavLink>
                <NavLink to='/buybonds' activeStyle>
                    Register Bid
                </NavLink>
                <NavLink to='/investor' activeStyle>
                    Bond List (Ropsten)
                </NavLink>
                <NavLink to='/bondlist' activeStyle>
                    Bond list
                </NavLink>
                <NavLink to='/company' activeStyle>
                    Company
                </NavLink>
                <NavLink to='/issuer' activeStyle>
                    Issuer
                </NavLink>
                <NavLink to='/regulation' activeStyle>
                    Regulator
                </NavLink>
                <NavLink to='/certifier' activeStyle>
                    Certificates
                </NavLink>
            </NavMenu>	
        </Nav>
        </>
    );
    };

export default Navbar;
