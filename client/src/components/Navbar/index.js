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
                    Buy Bonds
                </NavLink>
                <NavLink to='/issuetokens' activeStyle>
                    Issue Tokens
                </NavLink>
                <NavLink to='/company' activeStyle>
                    Company
                </NavLink>
                <NavLink to='/issuer' activeStyle>
                    Issuer
                </NavLink>
            </NavMenu>	
        </Nav>
        </>
    );
    };

export default Navbar;
