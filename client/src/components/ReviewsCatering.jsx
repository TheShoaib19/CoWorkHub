import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function StarDisplay({ rating }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div>
            {stars.map((star) => (
                <span key={star} className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                    ★
                </span>
            ))}
        </div>
    );
}

export default function ReviewsCatering({ Catering }) {
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviewsCatering = async () => {
            try {
                const res = await axios.get(`/api/reviews/catering/${Catering._id}`);
                setReviews(res.data);
            } catch (err) {
                setError('An error occurred while fetching reviews.');
                toast.error(err.message);
            }
        };

        fetchReviewsCatering();
    }, [Catering]);

    return (
        <div className="space-y-4">
            {reviews.length === 0 && <span className='font-bold'>No reviews yet</span>}
            {reviews.length > 0 && <span className='font-bold'>Reviews:</span>}
            {reviews.map((review) => (
                <div key={review._id} className="p-4 border border-gray-300 rounded-md space-y-2">
                    <p className="font-bold">{review.user && review.user.username ? review.user.username : 'Anonymous'}</p>
                    <StarDisplay rating={review.stars} />
                    <p>{review.comment}</p>
                </div>
            ))}
        </div>
    );
}
