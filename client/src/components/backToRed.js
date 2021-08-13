
import { Link } from 'react-router-dom';

const BacktoRed = () => {
    return (
        <>
            <button className="btn btn-secondary">
                <Link to="/red" className="text-white">Back to Bond Details</Link>
            </button>

        </>
    );
};

export default BacktoRed;