
import { Link } from 'react-router-dom';

const BacktoYellow = () => {
    return (
        <>
            <button className="btn btn-secondary">
                <Link to="/yellow" className="text-white">Back to Bond Details</Link>
            </button>

        </>
    );
};

export default BacktoYellow;