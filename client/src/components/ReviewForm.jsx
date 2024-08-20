import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function StarRating({ rating, setRating }) {
    const stars = [1, 2, 3, 4, 5];
    return (
        <div>
            {stars.map((star) => (
                <span key={star} className={`cursor-pointer text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`} onClick={() => setRating(star)}>
                    ★
                </span>
            ))}
        </div>
    );
}

export default function ReviewForm({ user, listing }) {
    const [stars, setStars] = useState(1);
    const [comment, setComment] = useState('');
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/reviews/create', { user: user._id, listing: listing._id, stars, comment });
            toast.success('Review submitted successfully', { autoClose: 2000 }); // Display toast for 5 seconds
            setShowForm(false);
            setTimeout(() => {
                window.location.reload();
            }, 2100);
        } catch (error) {
            toast.error(error.message, { autoClose: 2000 }); // Display toast for 5 seconds
        }
    };

    return (
        <div>
            <ToastContainer />
            <button onClick={() => setShowForm(!showForm)} className="p-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                {showForm ? 'Cancel' : 'Leave a Review?'}
            </button>
            <div className={`transition-all duration-500 overflow-hidden ${showForm ? 'max-h-screen' : 'max-h-0'}`}> {/* Ye div hatadena and sirf jumping wapas ayegi */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full p-8 border border-gray-300 rounded-md mt-4">
                        <label>
                            <StarRating rating={stars} setRating={setStars} />
                        </label>
                        <div className='flex flex-col'>
                            <span>Comment:</span>
                            <input value={comment} onChange={(e) => setComment(e.target.value)} required className="min-h-[100px] border border-gray-300 rounded-md p-2" />
                        </div>
                        <button type="submit" className="bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3">Submit Review</button>
                    </form>
                )}
            </div>
        </div>
    );
}