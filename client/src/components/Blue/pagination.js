
import { Link } from 'react-router-dom';

import {
    Nav,
} from 'react-bootstrap'

const Pagination = () => {
    return (
        <>
            
            <div className="container mr-auto ml-auto mt-4 text-center  border">
                <div className="font-weight-bold">Bond Blue</div>
            <Nav className="justify-content-center">
                <Nav.Link href="/blue"><button className="btn btn-light">BondDetails</button></Nav.Link>
                <Nav.Link href="/buyblue"><button className="btn btn-light">Investor Page</button></Nav.Link>
                <Nav.Link href="/issuerblue"><button className="btn btn-light">Issuer Page</button></Nav.Link>
                <Nav.Link href="/companyblue"><button className="btn btn-light">Company Page</button></Nav.Link>
                <Nav.Link href="/regulatorblue"><button className="btn btn-light">Regulator Page</button></Nav.Link>
            </Nav>
            </div>     
        </>
    );
};

export default Pagination;