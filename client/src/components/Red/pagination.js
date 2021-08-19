
import { Link } from 'react-router-dom';

import {
    Nav,
} from 'react-bootstrap'

const Pagination = () => {
    return (
        <>
            
            <div className="container mr-auto ml-auto mt-4 text-center  border">
                <div className="font-weight-bold">Bond red</div>
            <Nav className="justify-content-center">
                <Nav.Link href="/red"><button className="btn btn-light">BondDetails</button></Nav.Link>
                <Nav.Link href="/buyred"><button className="btn btn-light">Investor Page</button></Nav.Link>
                <Nav.Link href="/issuerred"><button className="btn btn-light">Issuer Page</button></Nav.Link>
                <Nav.Link href="/companyred"><button className="btn btn-light">Company Page</button></Nav.Link>
                <Nav.Link href="/regulatorred"><button className="btn btn-light">Regulator Page</button></Nav.Link>
            </Nav>
            </div>     
        </>
    );
};

export default Pagination;