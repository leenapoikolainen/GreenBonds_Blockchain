
import { Link } from 'react-router-dom';

import {
    Nav,
} from 'react-bootstrap'

const Pagination = () => {
    return (
        <>
            
            <div className="container mr-auto ml-auto mt-4 text-center  border">
                <div className="font-weight-bold">Bond Red</div>
            <Nav className="justify-content-center">
                <Nav.Link href="/yellow"><button className="btn btn-light">BondDetails</button></Nav.Link>
                <Nav.Link href="/buyyellow"><button className="btn btn-light">Investor Page</button></Nav.Link>
                <Nav.Link href="/issueryellow"><button className="btn btn-light">Issuer Page</button></Nav.Link>
                <Nav.Link href="/companyyellow"><button className="btn btn-light">Company Page</button></Nav.Link>
                <Nav.Link href="/regulatoryellow"><button className="btn btn-light">Regulator Page</button></Nav.Link>
            </Nav>
            </div>     
        </>
    );
};

export default Pagination;