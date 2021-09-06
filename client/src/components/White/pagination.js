import { Link } from 'react-router-dom';

const Pagination = () => {
    return (
        <>
            <div className="container mr-auto ml-auto mt-4 text-center py-3 ">
                <div className="font-weight-bold">Bond White</div>
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button className="btn btn-light">
                        <Link to="/white" className="text-dark">Bond Details</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/buywhite" className="text-dark">Investor Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/issuerwhite" className="text-dark">Issuer Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/companywhite" className="text-dark">Company Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/regulatorwhite" className="text-dark">Regulator Page</Link>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Pagination;