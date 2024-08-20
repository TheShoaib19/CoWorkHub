import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';
import CateringItem from '../components/CateringItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [floorListings, setFloorListings] = useState([]);
  const [deskListings, setDeskListings] = useState([]);
  const [CateringData, setCateringData] = useState([]);
  
  SwiperCore.use([Navigation]);
  
  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchFloorListings();
      } catch (error) {
        console.log(error);
      }
    }

    const fetchFloorListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=floor&limit=4');
        const data = await res.json();
        setFloorListings(data);
        fetchDeskListings();
      } catch (error) {
        console.log(error);
      }
    }

    const fetchDeskListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=desk&limit=4');
        const data = await res.json();
        setDeskListings(data);
      } catch (error) {
        console.log(error);
      }
    }

    const fetchCateringData = async () => {
      try {
        const res = await fetch('/api/catering/get?limit=4');
        const data = await res.json();
        setCateringData(data);
      } catch (error) {
        console.log(error);
      }
    }

    fetchOfferListings();
    fetchCateringData();
  }, []);

  return (
    <div>
      {/* Top */}
      <div className='flex flex-col gap-6 py-28 px-3 max-w-6xl mx-auto'>
        <h1 className='text-slate-700 font-bold text-3xl lg:text-6xl'>
          Find your next <span className='text-slate-500'>perfect</span> <br />place with ease
        </h1>
        <div className='text-gray-400 text-xs sm:text-sm'>
          CoWork Hub is the best place to find your next perfect place to live. <br />
          We have a wide range of properties for you to choose from.
        </div>
        <Link to={'/search'} className='text-xs sm:text-sm text-blue-800 font-bold hover:underline'>
          Let's get started
        </Link>
      </div>
      {/* Swiper */}
      <Swiper navigation>
        {
          offerListings && offerListings.length > 0 && offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div style={{background: `url(${listing.imageUrls[0]}) center no-repeat`, backgroundSize:"cover"}} className='h-[500px]'>
              </div>
            </SwiperSlide>
          ))
        }
      </Swiper>
      {/* Listing results for offer, desk and floor */}
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 my-10'>
        {
          offerListings && offerListings.length > 0 && (
            <div className="">
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-slate-600'>Recent Offers</h2>
                <Link className='text-sm text-blue-800 hover:underline' to={'/search?offer=true'}>
                  Show more offers
                </Link>
              </div>
              <div className='flex flex-wrap gap-4'>
                {
                  offerListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))
                }
              </div>
            </div>
          )
        }
        {
          floorListings && floorListings.length > 0 && (
            <div className="">
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-slate-600'>Recent places For Floor</h2>
                <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=floor'}>
                  Show more places for floor
                </Link>
              </div>
              <div className='flex flex-wrap gap-4'>
                {
                  floorListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))
                }
              </div>
            </div>
          )
        }
        {
          deskListings && deskListings.length > 0 && (
            <div className="">
              <div className='my-3'>
                <h2 className='text-2xl font-semibold text-slate-600'>Recent Places for Desk</h2>
                <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=desk'}>
                  Show more places for Desk
                </Link>
              </div>
              <div className='flex flex-wrap gap-4'>
                {
                  deskListings.map((listing) => (
                    <ListingItem listing={listing} key={listing._id} />
                  ))
                }
              </div>
            </div>
          )
        }
{/* Render Catering Data */}
{
        CateringData && CateringData.length > 0 && (
          <div className="">
            <div className='my-3'>
              <h2 className='text-2xl font-semibold text-slate-600'>Recent Catering Places</h2>
              <Link className='text-sm text-blue-800 hover:underline' to={'/search?type=catering'}>
                Show more catering places
              </Link>
            </div>
            <div className='flex flex-wrap gap-4'>
              {
                CateringData.map((catering) => (
                  <CateringItem Catering={catering} key={catering._id} />
                ))
              }
            </div>
          </div>
        )
      }
      </div>
    </div>
  );
}
