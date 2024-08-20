import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token, newPassword: password }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.message);
            } else {
                navigate('/sign-in');
            }
        } catch (error) {
            toast.error(error.message);
        }
        setLoading(false);
    };

    return (
        <>
        <ToastContainer />
        <div className='p-3 max-w-lg mx-auto'>
            <h1 className='text-3xl text-center font-semibold my-7'>Reset Password</h1>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <input
                    type='password'
                    placeholder='Enter new password'
                    className='border p-3 rounded-lg'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    disabled={loading}
                    className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
                >
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
        </>
    );
}
