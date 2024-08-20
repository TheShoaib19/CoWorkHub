import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminForm from '../components/AdminDashboard'; 

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); //prevents the page to reload when clicking
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if(data.success === false){
        dispatch(signInFailure(data.message));
        toast.error(data.message); // Show error message from the server
        return;
      }
      else if(data.role === 'admin'){
dispatch(signInSuccess(data));
      toast.success("Login Successfully!");
          setTimeout(() => {
            navigate('/admin');
      })
    }
      else{
      dispatch(signInSuccess(data));
      toast.success("Login Successfully!");
          setTimeout(() => {
            navigate('/');
          
          }, 2000);
        }
    } catch (error) {
      dispatch(signInFailure(error.message));
      toast.error(error.message); // Show error message
    }
  };
  return (
    <div className='p-3 max-w-lg mx-auto'>
      <ToastContainer /> {/* Ensure ToastContainer is placed here */}
      <h1 className='text-3xl text-center font-semibold my-7'>Sign In</h1>
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <input type="email" placeholder='Email' className='border p-3 rounded-lg' id='email' onChange={handleChange}/>
        <input type="password" placeholder='Password' className='border p-3 rounded-lg' id='password' onChange={handleChange}/>
        <button disabled={loading} className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'>
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-2 mt-5'>
        <p>Don't have an account? </p>
        <Link to="/sign-up">
          <span className='text-blue-700 hover:underline'>Sign Up</span>
        </Link>
      </div>
      <div>
        <Link to="/forgot-password" className='text-blue-700 hover:underline'>Forgot Password?</Link>
      </div>
    </div>
  )
}
