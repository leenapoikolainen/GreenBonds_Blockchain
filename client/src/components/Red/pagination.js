import {
    Nav,
} from 'react-bootstrap'

import { Link } from 'react-router-dom';

const Pagination = () => {
    return (
        <>
            
            <div className="container mr-auto ml-auto mt-4 text-center py-3 ">
                <div className="font-weight-bold">Bond Red</div>
                <div class="btn-group" role="group" aria-label="Basic example">
				<button className="btn btn-light">
					<Link to="/red" className="text-dark">Back Details</Link>
				</button>
				<button className="btn btn-light">
					<Link to="/buyred" className="text-dark">Investor Page</Link>
				</button>
				<button className="btn btn-light">
					<Link to="/issuerred" className="text-dark">Issuer Page</Link>
				</button>
				<button className="btn btn-light">
					<Link to="/companyred" className="text-dark">Company Page</Link>
				</button>
				<button className="btn btn-light">
					<Link to="/regulatorred" className="text-dark">Regulator Page</Link>
				</button>
			</div>
            {/*    
            <Nav className="justify-content-center">
                <Nav.Link href="/red"><button className="btn btn-light">BondDetails</button></Nav.Link>
                <Nav.Link href="/buyred"><button className="btn btn-light">Investor Page</button></Nav.Link>
                <Nav.Link href="/issuerred"><button className="btn btn-light">Issuer Page</button></Nav.Link>
                <Nav.Link href="/companyred"><button className="btn btn-light">Company Page</button></Nav.Link>
                <Nav.Link href="/regulatorred"><button className="btn btn-light">Regulator Page</button></Nav.Link>
            </Nav>
            */}
            </div>     
        </>
    );
};

export default Pagination;