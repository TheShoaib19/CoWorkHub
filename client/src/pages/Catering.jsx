import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css/bundle';
import CateringContact from '../components/CateringContact';
import ReviewsCatering from '../components/ReviewsCatering';
import ReviewFormCatering from '../components/ReviewFormCatering';
import axios from 'axios';
import {
  FaWifi, FaChair, FaSwimmer, FaMapMarkerAlt, FaParking, FaShare, FaCarBattery, FaCamera,
  FaPray, FaPhone, FaArchive, FaPrint, FaDrumstickBite, FaGamepad, FaWind, FaChartPie,
  FaRestroom, FaIdCard, FaDumbbell, FaWineBottle, FaMugHot, FaUserShield, FaCouch
} from 'react-icons/fa';

export default function Catering() {
  SwiperCore.use([Navigation]);
  const [catering, setCatering] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [error, setError] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedPrices, setSelectedPrices] = useState({});
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchCatering = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/catering/get/${params.cateringId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch data');
        }
        setCatering(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        console.error('Error fetching catering:', error);
        setError(true);
        setLoading(false);
      }
    };

    fetchCatering();
  }, [params.cateringId]);

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error('Please sign in to add items to your cart.');
      return;
    }

    try {
      const isInCartResponse = await axios.post('/api/cart/check', { CateringId: catering._id });
      if (isInCartResponse.data.isInCart) {
        toast.info('This item is already in your cart.');
        return;
      }

      const response = await axios.post('/api/cart/catering/add', {
        CateringId: catering._id,
        quantity: 1,
        selectedItems: selectedItems.map(item => ({
          name: item.name,
          price: item.price > 0 ? item.price : item.prices.find(price => price.unit === item.selectedUnit)?.price || 0,
          unit: item.selectedUnit,
          selected: true
        }))
      });

      if (response.status === 200) {
        toast.success('Item added to cart successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add item to cart.');
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      const isInCartResponse = await axios.post('/api/cart/check', { CateringId: catering._id });
      if (isInCartResponse.data.isInCart) {
        const removeResponse = await axios.post('/api/cart/remove', { CateringId: catering._id });
        if (removeResponse.status === 200) {
          toast.success('Item removed from cart successfully!');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error('Failed to remove item from cart.');
        }
      } else {
        toast.info('Item is not in the cart.');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(error.message || 'Failed to remove item from cart.');
    }
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.find(selectedItem => selectedItem._id === item._id)
        ? prevSelectedItems.filter((selectedItem) => selectedItem._id !== item._id)
        : [...prevSelectedItems, { ...item, selectedUnit: selectedPrices[item._id] }]
    );
  };

  const handlePriceChange = (itemId, unit) => {
    setSelectedPrices((prev) => ({
      ...prev,
      [itemId]: unit,
    }));
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.map(item =>
        item._id === itemId ? { ...item, selectedUnit: unit } : item
      )
    );
  };

  return (
    <main className='p-4'>
      <ToastContainer />
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && <p className='text-center my-7 text-2xl text-red-600'>Something went wrong!</p>}
      {catering && !loading && !error && (
        <div>
          <Swiper navigation>
            {catering.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <img src={url} alt="Catering" className='w-full h-[550px] object-cover rounded-lg shadow-md' />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer shadow-md'>
            <FaShare className='text-slate-500' onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }} />
          </div>
          {copied && (
            <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2 shadow-md'>
              Link copied!
            </p>
          )}
          <div className='max-w-4xl mx-auto p-3 my-7'>
            <p className='mb-4 text-2xl font-semibold text-black'>
              {catering.name}
            </p>
            <div className='flex items-center gap-4 mb-4'>
              <FaMapMarkerAlt className='text-green-700 text-2xl' />
              <p className='text-slate-600 text-sm'>{catering.address}</p>
            </div>
            <p className='text-slate-800 mb-4'>
              <span className='font-semibold text-black'>Description: </span>
              {catering.description}
            </p>
            {catering.items && catering.items.length > 0 && (
              <div className='bg-white p-4 shadow-md rounded-lg'>
                <table className='w-full border-collapse'>
                  <thead className='bg-gray-100'>
                    <tr>
                      <th className='p-3 border-b'>S.No</th>
                      <th className='p-3 border-b'>Select</th>
                      <th className='p-3 border-b'>Image</th>
                      <th className='p-3 border-b'>Name</th>
                      <th className='p-3 border-b'>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catering.items.map((item, index) => (
                      <tr key={item._id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <td className='p-3 text-center'>{index + 1}</td>
                        <td className='p-3 text-center'>
                          <input
                            type='checkbox'
                            checked={selectedItems.find(selectedItem => selectedItem._id === item._id) ? true : false}
                            onChange={() => handleCheckboxChange(item)}
                            className='form-checkbox h-5 w-5 text-blue-600'
                          />
                        </td>
                        <td className='p-3 text-center'>
                          <img
                            src={item.imageUrl || '/placeholder.jpg'}
                            alt={item.name}
                            className='w-16 h-16 object-cover rounded-lg mx-auto'
                          />
                        </td>
                        <td className='p-3 text-center'>{item.name}</td>
                        <td className='p-3'>
                          {item.price > 0 ? (
                            <div className='text-center text-gray-600'>{item.price} Rupees</div>
                          ) : (
                            Array.isArray(item.prices) && item.prices.length > 0 ? (
                              item.prices.map((price, index) => (
                                <div key={index} className='flex items-center mb-1'>
                                  <input
                                    type='radio'
                                    name={`price-${item._id}`}
                                    value={price.unit}
                                    checked={selectedPrices[item._id] === price.unit}
                                    onChange={() => handlePriceChange(item._id, price.unit)}
                                    className='form-radio h-5 w-5 text-blue-600'
                                  />
                                  <label className='ml-2 text-sm'>{price.unit}: {price.price} Rupees</label>
                                </div>
                              ))
                            ) : (
                              <div className='text-center text-gray-600'>No prices available</div>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {currentUser && catering.userRef !== currentUser._id && !contact && (
              <div className="flex gap-2 mt-4 mb-4">
                <button onClick={handleAddToCart} className='bg-blue-700 text-white rounded-lg uppercase hover:opacity-95 p-3'>
                  Add to Cart
                </button>
                <button onClick={handleRemoveFromCart} className='bg-red-700 text-white rounded-lg uppercase hover:opacity-95 p-3'>
                  Remove
                </button>
                {/* <button onClick={() => setContact(true)} className='bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 p-3'>
                  Contact Owner
                </button> */}
              </div>
            )}
            {contact && <CateringContact Catering={catering} />}
            {currentUser && catering.userRef !== currentUser._id && (
              <ReviewFormCatering user={currentUser} Catering={catering} />
            )}
            <ReviewsCatering Catering={catering} />
            {!currentUser && (
                <div>
                <span className='font-bold'>Please Sign-in to contact the owner or leave a review</span>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
