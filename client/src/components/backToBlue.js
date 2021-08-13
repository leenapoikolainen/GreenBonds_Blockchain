
import { Link } from 'react-router-dom';

const BacktoBlue = () => {
    return (
        <>
            <button className="btn btn-secondary">
                <Link to="/blue" className="text-white">Back to Bond Details</Link>
            </button>

        </>
    );
};

export default BacktoBlue;