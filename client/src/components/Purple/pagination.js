import {
    Nav,
} from 'react-bootstrap'

const Pagination = () => {
    return (
        <>           
            <div className="container mr-auto ml-auto mt-4 text-center  border">
                <div className="font-weight-bold">Bond Purple</div>
            <Nav className="justify-content-center">
                <Nav.Link href="/purple"><button className="btn btn-light">BondDetails</button></Nav.Link>
                <Nav.Link href="/buypurple"><button className="btn btn-light">Investor Page</button></Nav.Link>
                <Nav.Link href="/issuerpurple"><button className="btn btn-light">Issuer Page</button></Nav.Link>
                <Nav.Link href="/companypurple"><button className="btn btn-light">Company Page</button></Nav.Link>
                <Nav.Link href="/regulatorpurple"><button className="btn btn-light">Regulator Page</button></Nav.Link>
            </Nav>
            </div>     
        </>
    );
};

export default Pagination;