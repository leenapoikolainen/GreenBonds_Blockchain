import { Link } from 'react-router-dom';

const Pagination = () => {
    return (
        <>
            <div className="container mr-auto ml-auto mt-4 text-center py-3 ">
                <div className="font-weight-bold">Bond Purple</div>
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button className="btn btn-light">
                        <Link to="/purple" className="text-dark">Back Details</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/buypurple" className="text-dark">Investor Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/issuerpurple" className="text-dark">Issuer Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/companypurple" className="text-dark">Company Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/regulatorpurple" className="text-dark">Regulator Page</Link>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Pagination;