import React from 'react'
import { Link } from 'react-router-dom'
import { MdLocationOn } from 'react-icons/md'
import { FaArchive, FaCamera, FaCarBattery, FaChair, FaChartPie, FaDrumstickBite, FaDumbbell, FaGamepad, FaIdCard, FaMugHot, FaParking, FaPhone, FaPray, FaPrint, FaRestroom, FaUserShield, FaWifi, FaWind, FaWineBottle } from 'react-icons/fa';

export default function ListingItem({listing}) {
  return (
    <div className='bg-white shadow-md hover:shadow-lg transition-shadow overflow-hidden rounded-lg w-full sm:w-[330px]'>
        <Link to={`/listing/${listing._id}`}>
            <img src={listing.imageUrls[0]} alt="Listing Cover" className='h-[320px] sm:h-[220px] w-full object-cover hover:scale-105 transition-scale duration-300'/>
            <div className='p-3 flex flex-col gap-2 w-full'>
                <p className='truncate text-lg font-semibold text-slate-700 '>{listing.name}</p>
                <div className="flex items-center gap-1">
                    <MdLocationOn className='h-4 w-4 text-green-700'/>
                    <p className='truncate text-sm text-gray-600 w-full'>{listing.address}</p>
                </div>
                <p className='text-sm text-gray-600 line-clamp-2'>{listing.description}</p>
                <p className='text-slate-500 mt-2 font-semibold'>
                    PKR{' '}
                    {listing.offer ? listing.discountPrice.toLocaleString('en-US') : listing.regularPrice.toLocaleString('en-US')}
                    {listing.timeIntervalType === 'perHour' && '/hr'}
                    {listing.timeIntervalType === 'perDay' && '/day'}
                    {listing.timeIntervalType === 'perWeek' && '/week'}
                    {listing.timeIntervalType === 'perMonth' && '/month'}
                    {listing.timeIntervalType === 'perYear' && '/year'}
                </p>
                <div className='flex gap-4 text-slate-700'>
                    <div className="font-bold text-xs">
                        {listing.averageRating ? listing.averageRating.toFixed(1) : 'No'} stars ({listing.reviewCount || 0} reviews)
                    </div>
                    <div className='flex gap-2'>
                        {listing.parking && (
                            <div className="font-bold text-xs">
                                <FaParking className='text-lg'/>
                            </div>
                        )}
                        {listing.furnished && (
                            <div className="font-bold text-xs">
                                <FaChair className='text-lg'/>
                            </div>
                        )}
                        {listing.wifi && (
                            <div className="font-bold text-xs">
                                <FaWifi className='text-lg'/>
                            </div>
                        )}
                        {listing.generator && (
                            <div className="font-bold text-xs">
                                <FaCarBattery className='text-lg'/>
                            </div>
                        )}
                        {listing.cctv && (
                            <div className="font-bold text-xs">
                                <FaCamera className='text-lg'/>
                            </div>
                        )}
                        {listing.prayingArea && (
                            <div className="font-bold text-xs">
                                <FaPray className='text-lg'/>
                            </div>
                        )}
                        {listing.frontDeskService && (
                            <div className="font-bold text-xs">
                                <FaPhone className='text-lg'/>
                            </div>
                        )}
                        {listing.personalLocker && (
                            <div className="font-bold text-xs">
                                <FaArchive className='text-lg'/>
                            </div>
                        )}
                        {listing.printScan && (
                            <div className="font-bold text-xs">
                                <FaPrint className='text-lg'/>
                            </div>
                        )}
                        {listing.cafeteria && (
                            <div className="font-bold text-xs">
                                <FaDrumstickBite className='text-lg'/>
                            </div>
                        )}
                        {listing.gamingZone && (
                            <div className="font-bold text-xs">
                                <FaGamepad className='text-lg'/>
                            </div>
                        )}
                        {listing.fullyAC && (
                            <div className="font-bold text-xs">
                                <FaWind className='text-lg'/>
                            </div>
                        )}
                        {listing.conference && (
                            <div className="font-bold text-xs">
                                <FaChartPie className='text-lg'/>
                            </div>
                        )}
                        {listing.restRoom && (
                            <div className="font-bold text-xs">
                                <FaRestroom className='text-lg'/>
                            </div>
                        )}
                        {listing.rfidAccess && (
                            <div className="font-bold text-xs">
                                <FaIdCard className='text-lg'/>
                            </div>
                        )}
                        {listing.gym && (
                            <div className="font-bold text-xs">
                                <FaDumbbell className='text-lg'/>
                            </div>
                        )}
                        {listing.water && (
                            <div className="font-bold text-xs">
                                <FaWineBottle className='text-lg'/>
                            </div>
                        )}
                        {listing.complimentaryTea && (
                            <div className="font-bold text-xs">
                                <FaMugHot className='text-lg'/>
                            </div>
                        )}
                        {listing.security && (
                            <div className="font-bold text-xs">
                                <FaUserShield className='text-lg'/>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Link>
    </div>
  )
}
