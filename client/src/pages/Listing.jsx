import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules';
import { useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css/bundle';
import {
  FaWifi, FaChair, FaSwimmer, FaMapMarkerAlt, FaParking, FaShare, FaCarBattery, FaCamera,
  FaPray, FaPhone, FaArchive, FaPrint, FaDrumstickBite, FaGamepad, FaWind, FaChartPie,
  FaRestroom, FaIdCard, FaDumbbell, FaWineBottle, FaMugHot, FaUserShield, FaCouch
} from 'react-icons/fa';
import Contact from '../components/Contact';
import Reviews from '../components/Reviews';
import ReviewForm from '../components/ReviewForm';
import axios from 'axios';
import React from 'react';

export default function Listing() {
  const iconMap = {
    chair: FaChair,
    wifi: FaWifi,
    swimmer: FaSwimmer,
    MapMarker: FaMapMarkerAlt,
    parking: FaParking,
    share: FaShare,
    generator: FaCarBattery,
    cctv: FaCamera,
    prayingArea: FaPray,
    frontDeskService: FaPhone,
    personalLocker: FaArchive,
    printScan: FaPrint,
    cafeteria: FaDrumstickBite,
    gamingZone: FaGamepad,
    fullyAC: FaWind,
    conference: FaChartPie,
    restRoom: FaRestroom,
    rfidAccess: FaIdCard,
    gym: FaDumbbell,
    water: FaWineBottle,
    complimentaryTea: FaMugHot,
    security: FaUserShield,
    couch: FaCouch,
    furnished: FaChair,
  };

  SwiperCore.use([Navigation]);
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          setLoading(false);
          return;
        }
        setListing(data);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prevAmenities) =>
      prevAmenities.some((selectedAmenity) => selectedAmenity.name === amenity.name)
        ? prevAmenities.filter((selectedAmenity) => selectedAmenity.name !== amenity.name)
        : [...prevAmenities, amenity]
    );
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error("Please sign in to add items to your cart.");
      return;
    }

    try {
      const isInCartResponse = await axios.post('/api/cart/check', { listingId: listing._id });
      if (isInCartResponse.data.isInCart) {
        toast.info("This item is already in your cart.");
        return;
      }

      const response = await axios.post('/api/cart/add', { 
        listingId: listing._id, 
        quantity: 1,
        selectedAmenities: selectedAmenities.map(amenity => ({
          name: amenity.name,
          price: amenity.price,
          selected: true
        }))
      });
      if (response.status === 200) {
        toast.success("Item added to cart successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      const isInCartResponse = await axios.post('/api/cart/check', { listingId: listing._id });
      if (isInCartResponse.data.isInCart) {
        const removeResponse = await axios.post('/api/cart/remove', { listingId: listing._id });
        if (removeResponse.status === 200) {
          toast.success("Item removed from cart successfully!");
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error("Failed to remove item from cart.");
        }
      } else {
        toast.info("Item is not in the cart.");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main>
      <ToastContainer />
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && <p className='text-center my-7 text-2xl'>Something went wrong!</p>}
      {listing && !loading && !error && (
        <div>
          <Swiper navigation>
            {listing.imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                 <img src={url} alt="Listing Image" className='w-full h-[550px] object-cover' />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
            <FaShare className='text-slate-500' onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 2000);
            }} />
          </div>
          {copied && (
            <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>
              Link copied!
            </p>
          )}
          <div className='flex flex-col max-w-4xl mx-auto p-3 my-7 gap-4'>
            <p className='text-2xl font-semibold'>
              {listing.name} - PKR{' '}
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.timeIntervalType === 'perHour' && '/hr'}
              {listing.timeIntervalType === 'perDay' && '/day'}
              {listing.timeIntervalType === 'perWeek' && '/week'}
              {listing.timeIntervalType === 'perMonth' && '/month'}
              {listing.timeIntervalType === 'perYear' && '/year'}
            </p>
            <p className='flex items-center mt-6 gap-2 text-slate-600 text-sm'>
              <FaMapMarkerAlt className='text-green-700' />
              {listing.address}
            </p>
            <p className='flex items-center gap-2 text-slate-600 text-sm'>
              Area: {listing.area}
            </p>
            <div className='flex gap-4'>
              <p className='bg-red-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                {listing.type === 'floor' ? 'Floor' : listing.type === 'desk' ? 'Desk' : listing.type === 'room' ? 'Room' : listing.type === 'meetingRoom' ? 'Meeting Room' : listing.type === 'eventSpace' ? 'Event Space' : ''}
              </p>
              {listing.offer && (
                <p className='bg-green-900 w-full max-w-[200px] text-white text-center p-1 rounded-md'>
                  {+listing.regularPrice - +listing.discountPrice} OFF
                </p>
              )}
            </div>
            <p className='text-slate-800'>
              <span className='font-semibold text-black'>Description - </span>
              {listing.description}
            </p>

            <ul className="text-gray-800 font-semibold text-sm flex flex-wrap items-center gap-4">
              {listing.amenities.map((amenity, index) => {
                const Icon = iconMap[amenity.name];
                const isSelected = selectedAmenities.some(selectedAmenity => selectedAmenity.name === amenity.name);
                return (
                  <li key={index} className="flex items-center gap-1 whitespace-nowrap">
                    {Icon ? <Icon className="text-lg" /> : <span>Unknown</span>}
                    <span className="flex items-center gap-1">
                      {amenity.name}
                      {amenity.price > 0 && (
                        <span>
                          ({amenity.price})
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleAmenityToggle(amenity)}
                            className="ml-2"
                          />
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <div className="flex gap-2">
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
            {contact && <Contact listing={listing} />}
            {currentUser && listing.userRef !== currentUser._id && (
              <ReviewForm user={currentUser} listing={listing} />
            )}
            <Reviews listing={listing} />
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
