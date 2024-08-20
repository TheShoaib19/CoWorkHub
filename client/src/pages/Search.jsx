import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import CateringItem from "../components/CateringItem";

export default function Search() {
    const amenitiesList = [
        { id: 'parking', label: 'Parking Spot' },
        { id: 'furnished', label: 'Furnished' },
        { id: 'wifi', label: 'Wi-fi' },
        { id: 'generator', label: 'Generator' },
        { id: 'cctv', label: 'CCTV surveillance' },
        { id: 'prayingArea', label: 'Praying Area' },
        { id: 'frontDeskService', label: 'Front Desk' },
        { id: 'personalLocker', label: 'Personal Locker' },
        { id: 'printScan', label: 'Print & Scan' },
        { id: 'cafeteria', label: 'Cafeteria' },
        { id: 'gamingZone', label: 'Gaming Zone' },
        { id: 'fullyAC', label: 'Air Conditioned' },
        { id: 'conference', label: 'Conference Room' },
        { id: 'restRoom', label: 'Rest Room' },
        { id: 'rfidAccess', label: 'RFID Access' },
        { id: 'gym', label: 'Gym' },
        { id: 'water', label: 'Mineral Water' },
        { id: 'complimentaryTea', label: 'Complimentary Tea' },
        { id: 'security', label: 'Security' }
    ];

    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarData, setSidebarData] = useState({
        searchTerm: '',
        type: 'all',
        amenities: [],
        offer: false,
        area: 'all',
        serviceType: 'all',
        capacity: 0,
        sort: 'created_at',
        order: 'desc',
        cateringName: '',
        regularPrice: 0, // Set a default maximum value here
    });
    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState([]);
    const [cateringItems, setCateringItems] = useState([]);
    const [showMore, setShowMore] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        const typeFromUrl = urlParams.get('type');
        const offerFromUrl = urlParams.get('offer');
        const sortFromUrl = urlParams.get('sort');
        const areaFromUrl = urlParams.get('area');
        const orderFromUrl = urlParams.get('order');
        const capacityFromUrl = parseInt(urlParams.get('capacity')) || 0;
        const cateringNameFromUrl = urlParams.get('cateringName') || '';

        const amenitiesFromUrl = amenitiesList.reduce((acc, amenity) => {
            if (urlParams.get(amenity.id) === 'true') {
                acc.push(amenity.id);
            }
            return acc;
        }, []);
        

        setSidebarData({
            searchTerm: searchTermFromUrl || '',
            type: typeFromUrl || 'all',
            amenities: amenitiesFromUrl,
            offer: offerFromUrl === 'true',
            sort: sortFromUrl || 'created_at',
            area: areaFromUrl || 'all',
            order: orderFromUrl || 'desc',
            capacity: capacityFromUrl,
            cateringName: cateringNameFromUrl,
            serviceType: urlParams.get('serviceType') || 'all',
            regularPrice: parseInt(urlParams.get('regularPrice')) || 0,
        });

        const fetchListings = async () => {
            setLoading(true);
            setShowMore(false);
            const searchQuery = urlParams.toString();
            const res = await fetch(`/api/listing/get?${searchQuery}`);
            const data = await res.json();
            const filteredListings = filterListingsByAmenities(data, amenitiesFromUrl);
            if (data.length < 9) {
                setShowMore(false);
            }

            setListings(filteredListings);
            console.log(listings);
            setLoading(false);
        };

        const fetchCateringItems = async () => {
            setLoading(true);
            setShowMore(false);
            const searchQuery = new URLSearchParams({
                name: sidebarData.cateringName,
                area: sidebarData.area,
                serviceType: sidebarData.serviceType,
                capacity: sidebarData.capacity,
            }).toString();
            const res = await fetch(`/api/catering/get?${searchQuery}`);
            const data = await res.json();
            const filteredCateringItems = filterListingsByAmenities(data, amenitiesFromUrl);
            if (data.length > 8) {
                setShowMore(true);
            } else {
                setShowMore(false);
            }
            setCateringItems(filteredCateringItems);
            setLoading(false);
        };

        if (sidebarData.type === 'catering') {
            fetchCateringItems();
        } else {
            fetchListings();
        }
    }, [location.search, sidebarData.type]);

    const handleChange = (e) => {
        const { id, value, checked } = e.target;

        if (['all', 'floor', 'desk', 'room', 'meetingRoom', 'eventSpace', 'catering'].includes(id)) {
            setSidebarData({
                ...sidebarData,
                type: id
            });
        } else if (id === 'searchTerm') {
            setSidebarData({ ...sidebarData, searchTerm: value });
        } else if (id === 'cateringName') {
            setSidebarData({ ...sidebarData, cateringName: value });
        } else if (id === 'capacity') {
            setSidebarData({ ...sidebarData, capacity: Number(value) });
        } else if (id === 'area') {
            setSidebarData({ ...sidebarData, area: value });
        } else if (id === 'serviceType') {
            setSidebarData({ ...sidebarData, serviceType: value });
        } else if (id === 'sort_order') {
            const sort = value.split('_')[0] || 'created_at';
            const order = value.split('_')[1] || 'desc';
            setSidebarData({
                ...sidebarData,
                sort,
                order
            });
        }
            else if (id === 'regularPrice') {
                setSidebarData({ ...sidebarData, regularPrice: Number(value) });
            
        } else {
            setSidebarData((prev) => ({
                ...prev,
                amenities: checked
                    ? [...prev.amenities, id]
                    : prev.amenities.filter((amenity) => amenity !== id)
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sidebarData.searchTerm);
         urlParams.set('type', sidebarData.type);
        sidebarData.amenities.forEach(amenity => urlParams.set(amenity, true));
        urlParams.set('offer', sidebarData.offer);
        urlParams.set('sort', sidebarData.sort);
        urlParams.set('area', sidebarData.area);
        urlParams.set('order', sidebarData.order);
        
        if (sidebarData.regularPrice > 0) {
        urlParams.set('regularPrice', sidebarData.regularPrice);
        }
       
        if (sidebarData.type === 'catering') {
            urlParams.set('cateringName', sidebarData.cateringName);
            urlParams.set('serviceType', sidebarData.serviceType);
            if (sidebarData.capacity > 0) {
                urlParams.set('capacity', sidebarData.capacity);
            }
        }
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    };

    const onShowMoreClick = async () => {
        const numberOfListings = listings.length;
        const numberOfCateringItems = cateringItems.length;
        const startIndex = Math.max(numberOfListings, numberOfCateringItems);
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('startIndex', startIndex);
        const searchQuery = urlParams.toString();
        if (sidebarData.type === 'catering') {
            const resCatering = await fetch(`/api/catering/get?${searchQuery}`);
            const dataCatering = await resCatering.json();
            setCateringItems(prev => [...prev, ...dataCatering]);
            if (dataCatering.length < 9) {
                setShowMore(false);
            }
        } else {
            const res = await fetch(`/api/listing/get?${searchQuery}`);
            const data = await res.json();
            setListings(prev => [...prev, ...data]);
            if (data.length < 9) {
                setShowMore(false);
            }
            
        
        }
    };

    // const filterListingsByAmenities = (listings, amenities) => {
    //     if (amenities.length === 0) {
    //         return listings;
    //     }
    //     return listings.filter(listing => amenities.every(amenity => listing.amenities.includes(amenity)));
    // };


    // ===============================================
    // const filterListingsByAmenities = (listings, amenitiesFromUrl) => {
    //     if (amenitiesFromUrl.length === 0) {
    //         return listings;
    //     }
    
    //     return listings.filter(listing => {
    //         // Filter only those listings where all the amenities in the URL match exactly with the listing amenities
    //         return amenitiesFromUrl.every(amenityId => {
    //             const listingAmenity = listing.amenities.find(amenity => amenity.name === amenityId);
    //             return listingAmenity && listingAmenity.value === true;
    //         });
    //     });
    // };
    // =================================================
    const filterListingsByAmenities = (listings, amenitiesFromUrl) => {
        if (amenitiesFromUrl.length === 0) {
            return listings;
        }
    
        return listings.filter(listing => {
            // Return listings that have at least one matching amenity from the URL parameters
            return amenitiesFromUrl.some(amenityId => {
                const listingAmenity = listing.amenities.find(amenity => amenity.name === amenityId);
                return listingAmenity && listingAmenity.value === true;
            });
        });
    };
    
    
    

    return (
        <div className="flex">
            {sidebarData.type === 'catering' ? (
                <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen max-w-[350px]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                                <label className="font-semibold">Name:</label>
                                <input
                                    type="text"
                                    id="cateringName"
                                    value={sidebarData.cateringName}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3"
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="font-semibold">Area:</label>
                                <select id="area" value={sidebarData.area} onChange={handleChange} className="border rounded-lg p-3">
                                    <option value="all">All</option>
                                    <option value='Tariq Road'>Tariq Road</option>
                                    <option value='Bahadurabad'>Bahadurabad</option>
                                    <option value='Defence'>Defence</option>
                                </select>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="font-semibold">Service Type:</label>
                                <select id="serviceType" value={sidebarData.serviceType} onChange={handleChange} className="border rounded-lg p-3">
                                    <option value="all">All</option>
                                    <option value="corporate">Corporate</option>
                                    <option value="wedding">Wedding</option>
                                    <option value="seminar">Seminar</option>
                                </select>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label className="font-semibold">Capacity:</label>
                                <input
                                    type="number"
                                    id="capacity"
                                    value={sidebarData.capacity}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3"
                                />
                            </div>
                        </div>
                        <button type="submit" className="p-3 border rounded-lg bg-black text-white">Search</button>
                    </form>
                </div>
            ) : (
                <div className="p-7 border-b-2 md:border-r-2 md:min-h-screen max-w-[350px]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            {/* <div className="flex gap-2 items-center">
                                <label className="font-semibold">Search:</label>
                                <input
                                    type="text"
                                    id="searchTerm"
                                    value={sidebarData.searchTerm}
                                    onChange={handleChange}
                                    className="border rounded-lg p-3"
                                />
                            </div> */}
                
                            <div className="flex gap-2 items-center">
                                <label className="font-semibold">Sort:</label>
                                <select onChange={handleChange} defaultValue={'created_at_desc'} id="sort_order" className="border rounded-lg p-3">
                                    <option value='regularPrice_desc'>Price high to low</option>
                                    <option value='regularPrice_asc'>Price low to high</option>
                                    <option value='createdAt_desc'>Latest</option>
                                    <option value='createdAt_asc'>Oldest</option>
                                </select>
                            </div>
                            <div className="flex gap-2 items-center">
                                <label htmlFor="area" className="font-semibold">Area</label>
                                <select value={sidebarData.area} onChange={handleChange} id="area" className="border rounded-lg p-3">
                                    <option value="all">All</option>
                                    <option value='Tariq Road'>Tariq Road</option>
                                    <option value='Bahadurabad'>Bahadurabad</option>
                                    <option value='Defence'>Defence</option>
                                </select>
                            </div>
                            <label htmlFor="regularPrice" className="font-semibold">Price : {sidebarData.regularPrice}</label>
                            <input
                                type="range"
                                id="regularPrice"
                                min="0"
                                max="1000000"
                                step="10"
                                value={sidebarData.regularPrice}
                                onChange={handleChange}
                                className="w-full"
                            />
                            {/* <div className="flex gap-2 items-center">
                                <input onChange={() => setSidebarData(prev => ({ ...prev, offer: !prev.offer }))} checked={sidebarData.offer} type="checkbox" id="offer" className="w-5" />
                                <label htmlFor="offer" className="font-semibold cursor-pointer">Offers</label>
                            </div> */}
                            <div className="flex flex-col items-start gap-2">
                                <label className="font-semibold">Amenities:</label>
                                <div className="grid grid-cols-2 gap-2">
                                {amenitiesList.map(({ id, label }) => (
                                        <div className="flex gap-2 items-center" key={id}>
                                            <input
                                                type="checkbox"
                                                id={id}
                                                checked={sidebarData.amenities.includes(id)}
                                                onChange={handleChange}
                                                className="w-5"
                                            />
                                            <label htmlFor={id} className="cursor-pointer">{label}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="p-3 border rounded-lg bg-black text-white">Search</button>
                    </form>
                </div>
            )}
            <div className="flex-1 p-7">
                {loading && <p>Loading...</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sidebarData.type === 'catering' ? (
                        cateringItems.map(catering => (
                            <CateringItem Catering={catering} key={catering._id} />
                        ))
                    ) : (
                        listings.map(listing => (
                            <ListingItem key={listing._id} listing={listing} />
                        ))
                    )}
                </div>
                {showMore && (
                    <div className="flex justify-center mt-6">
                        <button onClick={onShowMoreClick} className="bg-blue-500 text-white py-2 px-4 rounded">Show More</button>
                    </div>
                )}
            </div>
        </div>
    );
}
