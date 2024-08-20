import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';  // Adjust the path according to your directory structure
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: '',
    document: null
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      role: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file && file.type !== 'application/pdf') {
        toast.info('Only PDF files are allowed.');
        e.target.value = null; // Clear the input field if the file is not a PDF
    } else {
        setFormData({
            ...formData,
            document: file
        });
    }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await res.json();

      if (data.success === false) {
        toast.error(data.message);
      } else {
        navigate('/sign-in');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="p-3 max-w-lg mx-auto">
       <ToastContainer />
      <h1 className="text-3xl text-center font-semibold my-7">Sign Up</h1>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} encType="multipart/form-data">
        <input 
          type="text" 
          placeholder="Username" 
          className="border p-3 rounded-lg" 
          id="username" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="border p-3 rounded-lg" 
          id="email" 
          onChange={handleChange} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-3 rounded-lg" 
          id="password" 
          onChange={handleChange} 
          required 
        />
        <div>
          <p>Choose your role:</p>
          <div className="flex gap-4">
            <label className="flex gap-1">
              <input 
                type="radio" 
                name="role" 
                value="vendor" 
                onChange={handleRoleChange} 
                required 
              />
              Vendor
            </label>
            <label className="flex gap-1">
              <input 
                type="radio" 
                name="role" 
                value="consumer" 
                onChange={handleRoleChange} 
                required 
              />
              Consumer
            </label>
          </div>
        </div>

        {formData.role === 'vendor' && (
  <div>
    <label htmlFor="document" className="block mb-1">Upload Document:</label>
    <ul>  
    <label htmlFor="taxCertificate" className="block mb-1">For Example:</label>
    <label htmlFor="taxCertificate" className="block mb-1">Tax Certificate, Business License, Health and safety Certificate, CNIC, etc  </label>
    </ul>
    <input 
      type="file" 
      className="border p-3 rounded-lg" 
      id="document" 
      onChange={handleFileChange} 
      required 
    />
  </div>
)}
        <button 
          disabled={loading} 
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
        <OAuth />
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an account?</p>
        <Link to="/sign-in">
          <span className="text-blue-700">Sign In</span>
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
}
