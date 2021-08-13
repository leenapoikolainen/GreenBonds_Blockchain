
import { Link } from 'react-router-dom';

const BacktoBondList = () => {
    return (
        <>
            <button className="btn btn-secondary">
                <Link to="/bondlist" className="text-white">Back to Bond List</Link>
            </button>

        </>
    );
};

export default BacktoBondList;