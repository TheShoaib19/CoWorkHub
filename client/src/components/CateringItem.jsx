import React from 'react';
import { Link } from 'react-router-dom';
import { MdLocationOn } from 'react-icons/md';

const CateringItem = ({ Catering }) => {
  return (
    <div className='bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]'>
      <Link to={`/catering/get/${Catering._id}`}>
        <img
          src={Catering.imageUrls && Catering.imageUrls.length > 0 ? Catering.imageUrls[0] : '/placeholder.jpg'}
          alt="Catering Cover"
          className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'
        />
        <div className='p-3 flex flex-col gap-2 w-full'>
          <p className='truncate text-lg font-semibold text-slate-700'>{Catering.name}</p>
          <div className="flex items-center gap-1">
            <MdLocationOn className='h-4 w-4 text-green-700' />
            <p className='truncate text-sm text-gray-600 w-full'>{Catering.address}</p>
          </div>
          <div className='flex gap-4 text-slate-700'>
            <div className="font-bold text-xs">
              {Catering.averageRating ? `${Catering.averageRating.toFixed(1)} stars` : 'No stars'} ({Catering.reviewCount || 0} reviews)
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CateringItem;
