import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.message);
            } else {
                toast.success(data.message);
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
            <h1 className='text-3xl text-center font-semibold my-7'>Forgot Password</h1>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <input
                    type='email'
                    placeholder='Enter your email'
                    className='border p-3 rounded-lg'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <button
                    disabled={loading}
                    className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
                >
                    {loading ? 'Sending...' : 'Submit'}
                </button>
            </form>
        </div>
        </>
    );
}
