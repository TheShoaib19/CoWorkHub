import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserStart, deleteUserSuccess, deleteUserFailure, signOutUserStart, signOutUserSuccess, signOutUserFailure } from '../redux/user/userSlice';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';  

export default function Profile() {
  const fileRef = useRef(null);
  const {currentUser, loading, error} = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const [showListings, setShowListings] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteListingModalOpen, setIsDeleteListingModalOpen] = useState(false);
  const [listingIdToDelete, setListingIdToDelete] = useState(null);
  const [showListingsError, setShowListingsError] = useState(false);
  const [showCatering, setShowCatering] = useState(false);
  const [userCatering, setUserCatering] = useState([]);
  const [isDeleteCateringModalOpen, setIsDeleteCateringModalOpen] = useState(false);
  const [cateringIdToDelete, setCateringIdToDelete] = useState(null);
  const [showCateringError, setShowCateringError] = useState(false);

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    const fileData = new FormData();
    fileData.append('file', file);

    try {
      const res = await fetch('/api/uploadImageFile', {
        method: 'POST',
        body: fileData
      });
      const data = await res.json();
      if (data.success) {
        setFormData({ ...formData, avatar: data.fileUrl });
        toast.success('Image uploaded successfully!');
      } else {
        setFileUploadError(true);
        toast.error('Error uploading image.');
      }
    } catch (error) {
      toast.error('Error uploading image.' + error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }
      dispatch(updateUserSuccess(data));
      setFormData({ ...formData, avatar: data.fileUrl });
      toast.success('Updated Successfully!');
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    setIsDeleteModalOpen(true);
  }

  const confirmDeleteUser = async () => {
    try {
      setIsDeleteModalOpen(false);
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      clearCartItemCount();
      reloadPage();
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  }

  const reloadPage = () => {
    window.location.reload();
  };

  let clearCartItemCount = () => {
    localStorage.removeItem('cartItemCount');
  };

  const handleShowListings = async () => {
    if (showListings) {
      setShowListings(false);
    } else {
      try {
        setShowListingsError(false);
        const res = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) {
          setShowListingsError(true);
          return;
        }
        setUserListings(data);
        setShowListings(true);
      } catch (error) {
        setShowListingsError(true);
      }
    }
  }

  const handleListingDelete = (listingId) => {
    setListingIdToDelete(listingId);
    setIsDeleteListingModalOpen(true);
  }

  const confirmDeleteListing = async () => {
    try {
      const res = await fetch(`/api/listing/delete/${listingIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings(prev =>
        prev.filter((listing) => listing._id !== listingIdToDelete)
      );
      toast.success('Listing deleted successfully');
      setIsDeleteListingModalOpen(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleShowCatering = async () => {
    if (showCatering) {
      setShowCatering(false);
    } else {
      try {
        setShowCateringError(false);
        const res = await fetch(`/api/user/catering/${currentUser._id}`);
        const data = await res.json();
        if (data.success === false) {
          setShowCateringError(true);
          return;
        }
        setUserCatering(data);
        setShowCatering(true);
      } catch (error) {
        setShowCateringError(true);
      }
    }
  }

  const handleCateringDelete = (cateringId) => {
    setCateringIdToDelete(cateringId);
    setIsDeleteCateringModalOpen(true);
  }

  const confirmDeleteCatering = async () => {
    try {
      const res = await fetch(`/api/catering/delete/${cateringIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserCatering(prev =>
        prev.filter((catering) => catering._id !== cateringIdToDelete)
      );
      toast.success('Catering item deleted successfully');
      setIsDeleteCateringModalOpen(false);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <>
      {loading && <Loader />}
      <ToastContainer />
      <div className='p-3 max-w-lg mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            ref={fileRef}
            hidden
            accept='image/*'
          />
          <img
            src={formData.avatar || currentUser.avatar}
            onClick={() => fileRef.current.click()}
            alt="Profile picture"
            className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
          />
          {fileUploadError && (
            <p className='text-red-700 text-sm self-center'>
              Error Image Upload
            </p>
          )}
          <input
            type="text"
            placeholder='Username'
            id='username'
            defaultValue={currentUser.username}
            onChange={handleChange}
            className='border p-3 rounded-lg'
          />
          <input
            type="email"
            placeholder='Email'
            id='email'
            defaultValue={currentUser.email}
            onChange={handleChange}
            className='border p-3 rounded-lg'
          />
          <input
            type="password"
            placeholder='Password'
            id='password'
            onChange={handleChange}
            className='border p-3 rounded-lg'
          />
          <button
            disabled={loading}
            className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
          >
            {loading ? 'Loading...' : 'Update'}
          </button>
          {currentUser.role === 'vendor' && (
            <Link
              to={"/create-listing"}
              className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
            >
              Add Work spaces
            </Link>
          )}
           {currentUser.role === 'vendor' && (
            <Link
              to={"/AddCatering"}
              className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
            >
              Add Catering
            </Link>
          )}
        </form>
        <div className='flex justify-between mt-5'>
          <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer '>Delete Account</span>
          <span onClick={handleSignOut} className='text-red-700 cursor-pointer '>Sign Out</span>
        </div>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg">
              <p className="text-lg mb-4">Are you sure you want to delete your account?</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="mr-4 px-4 py-2 border border-gray-400 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {isDeleteListingModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg">
              <p className="text-lg mb-4">Are you sure you want to delete this listing?</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsDeleteListingModalOpen(false)}
                  className="mr-4 px-4 py-2 border border-gray-400 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteListing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {isDeleteCateringModalOpen && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg">
              <p className="text-lg mb-4">Are you sure you want to delete this listing?</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsDeleteCateringModalOpen(false)}
                  className="mr-4 px-4 py-2 border border-gray-400 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCatering}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {error && <p className='text-red-700 mt-5'>{error}</p>}
        {currentUser.role === 'vendor' && (
          <button onClick={handleShowListings} className='text-green-700 w-full'>
            {showListings ? 'Hide Listings' : 'Show Listings'}
          </button>
          
        )}
        {showListings && userListings.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h1 className='text-center mt-7 text-2xl font-semibold'>Your Listings</h1>
            {userListings.map((listing) => (
              <div key={listing._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
                <Link to={`/listing/${listing._id}`}>
                  <img src={listing.imageUrls[0]} alt="Listing Cover" className='h-16 w-16 object-contain'/>
                </Link>
                <Link to={`/listing/${listing._id}`} className='text-slate-700 font-semibold hover:underline truncate flex-1'>
                  <p>{listing.name}</p>
                </Link>
                <div className='flex flex-col items-center'>
                  <button
                    onClick={() => handleListingDelete(listing._id)}
                    className='text-red-700 uppercase'
                  >
                    Delete
                  </button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-green-700 uppercase'>Edit</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        {currentUser.role === 'vendor' && (
          <button onClick={handleShowCatering} className='text-green-700 w-full'>
            {showCatering ? 'Hide Catering' : 'Show Caterings'}
          </button>
          
        )}
        {showCatering && userCatering.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h1 className='text-center mt-7 text-2xl font-semibold'>Your Caterings</h1>
            {userCatering.map((catering) => (
              <div key={catering._id} className='border rounded-lg p-3 flex justify-between items-center gap-4'>
                <Link to={`/catering/${catering._id}`}>
                  <img src={catering.imageUrls[0]} alt="Listing Cover" className='h-16 w-16 object-contain'/>
                </Link>
                <Link to={`/catering/${catering._id}`} className='text-slate-700 font-semibold hover:underline truncate flex-1'>
                  <p>{catering.name}</p>
                </Link>
                <div className='flex flex-col items-center'>
                  <button
                    onClick={() => handleCateringDelete(catering._id)}
                    className='text-red-700 uppercase'
                  >
                    Delete
                  </button>
                  <Link to={`/UpdateCatering/${catering._id}`}>
                    <button className='text-green-700 uppercase'>Edit</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}