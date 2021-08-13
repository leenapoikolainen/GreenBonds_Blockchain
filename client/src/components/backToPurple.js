
import { Link } from 'react-router-dom';

const BacktoPurple = () => {
    return (
        <>
            <button className="btn btn-secondary">
                <Link to="/purple" className="text-white">Back to Bond Details</Link>
            </button>

        </>
    );
};

export default BacktoPurple;