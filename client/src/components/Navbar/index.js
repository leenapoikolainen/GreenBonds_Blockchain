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
    const [open, setOpen] = useState(false);

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
            </NavMenu>	
        </Nav>
        </>
    );
    };

export default Navbar;
