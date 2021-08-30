import { Link } from 'react-router-dom';

const Pagination = () => {
    return (
        <>
            <div className="container mr-auto ml-auto mt-4 text-center py-3 ">
                <div className="font-weight-bold">Bond Yellow</div>
                <div class="btn-group" role="group" aria-label="Basic example">
                    <button className="btn btn-light">
                        <Link to="/yellow" className="text-dark">Bond Details</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/buyyellow" className="text-dark">Investor Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/issueryellow" className="text-dark">Issuer Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/companyyellow" className="text-dark">Company Page</Link>
                    </button>
                    <button className="btn btn-light">
                        <Link to="/regulatoryellow" className="text-dark">Regulator Page</Link>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Pagination;