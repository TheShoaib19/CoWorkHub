import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';  

export default function CreateListing() {
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

    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'desk',
        regularPrice: 50,
        discountPrice: 0,
        numberOfChairs: 0,
        offer: false,
        amenities: [],
        amenitiesType: 'fixed', // New state for amenities price type
        timeIntervalType: 'perWeek'
    });
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState([]);
    
    // Fetch files from backend
    const fetchFiles = async (filename) => {
        try {
            const response = await fetch(`${filename}`);
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();
            return blob;
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    useEffect(() => {
        const getFileUrls = async () => {
            if (formData.imageUrls.length > 0) {
                try {
                    const promises = formData.imageUrls.map(async (imageUrl) => {
                        const blob = await fetchFiles(imageUrl);
                        return URL.createObjectURL(blob);
                    });
                    const urls = await Promise.all(promises);
                    setImageUrls(urls);
                } catch (error) {
                    toast.error(error.message);
                }
            }
        };

        getFileUrls();
    }, [formData.imageUrls]);

    const handleImageSubmit = async () => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }
    
        setUploading(true);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload images');
            }
    
            const data = await response.json();
    
            // Ensure that data.fileUrls is an array of URLs
            if (Array.isArray(data.fileUrls)) {
                setFormData(prevData => ({
                    ...prevData,
                    imageUrls: [...prevData.imageUrls, ...data.fileUrls]
                }));
                toast.success(`${data.fileUrls.length} images uploaded successfully!`);
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };
    const handleRemoveImage = (index) => {
        setFormData({ ...formData, imageUrls: formData.imageUrls.filter((_, i) => i !== index) });
    };
    
    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };
    
    const handleChange = (e) => {
        const { checked, name, value, type, id, price } = e.target;

        if (type === 'checkbox' && id === 'amenities') {
            let updatedAmenities;
            if (checked) {
                updatedAmenities = [...formData.amenities, { name: name, value: true, price: price !== undefined ? price : 0 }];
            } else {
                updatedAmenities = formData.amenities.filter((amenity) => amenity.name !== name);
            }
            setFormData({ ...formData, amenities: updatedAmenities });
        } else if (id === 'desk' || id === 'floor' || id === 'meetingRoom' || id === 'eventSpace' || id === 'room') {
            setFormData({ ...formData, type: id });
        } else if (id === 'area') {
            setFormData({ ...formData, area: value });
        } else if (id === 'offer') {
            setFormData({ ...formData, [id]: checked });
        } else if (id === 'fixed' || id === 'customize') {
            setFormData({ ...formData, amenitiesType: id });
        } else if (type === 'number' || type === 'text' || type === 'textarea') {
            setFormData({ ...formData, [id]: value });
        } else if (id === 'perDay' || id === 'perHour' || id === 'perWeek' || id === 'perMonth' || id === 'perYear') {
            setFormData({ ...formData, timeIntervalType: id });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.imageUrls.length < 1) return toast.error('You need to upload at least one image');
            if (+formData.regularPrice < +formData.discountPrice) return toast.error('Discounted price cannot be higher than regular price');
            setLoading(true);
            setError(false);
            const res = await fetch('/api/listing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id,
                }),
            });
            const data = await res.json();
            setLoading(false);

            if (!data.success) {
                toast.error("Record Created Succesfully");
                navigate(`/listing/${data._id}`);
            }

        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    }

    return (
        <>
         {loading && <Loader />}
            <ToastContainer />
            <main className='p-3 max-w-4xl mx-auto'>
                <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
                <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>
                <input onChange={handleChange} value={formData.name} type="text" placeholder='Name' className='border p-3 rounded-lg' id='name' maxLength='62' minLength='10' required/>
                <textarea onChange={handleChange} value={formData.description} type="text" placeholder='Description' className='border p-3 rounded-lg' id='description' required/>
                <input onChange={handleChange} value={formData.address} type="text" placeholder='Address' className='border p-3 rounded-lg' id='address' required/>
                <div className="flex gap-2 relative">
                    <select className="border rounded-lg p-3" name="" id="area" onChange={handleChange} value={formData.area} required>
                        <option value="" >Select Area </option>
                        <option value="Tariq Road">Tariq Road</option>
                        <option value="Bahadurabad">Bahadurabad</option>
                        <option value="Defence">Defence</option>
                    </select>
                </div>
                <p className='font-semibold'>Listing Type:</p>
                <div className='flex gap-6 flex-wrap'>
                    <div className="flex gap-2">
                        <input type="radio" name="listingType" id="desk" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'desk'} />
                        <label htmlFor="desk" className="cursor-pointer">Desk</label>
                    </div>
                    <div className="flex gap-2">
                        <input type="radio" name="listingType" id="floor" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'floor'}/>
                        <label htmlFor="floor" className="cursor-pointer">Floor</label>
                    </div>
                    <div className="flex gap-2">
                        <input type="radio" name="listingType" id="room" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'room'}/>
                        <label htmlFor="room" className="cursor-pointer">Room</label>
                    </div>
                    <div className="flex gap-2">
                        <input type="radio" name="listingType" id="meetingRoom" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'meetingRoom'}/>
                        <label htmlFor="meetingRoom" className="cursor-pointer">Meeting Room</label>
                    </div>
                    <div className="flex gap-2">
                        <input type="radio" name="listingType" id="eventSpace" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.type === 'eventSpace'}/>
                        <label htmlFor="eventSpace" className="cursor-pointer">Event Space</label>
                    </div>
                </div>

                {/* Desk Section Starts */}
                {formData.type === 'desk' && (
                    <div>
                        <p className='font-semibold'>Time Interval:</p>
                        <div className='flex gap-6 flex-wrap'>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perWeek" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perWeek'}/>
                                <label htmlFor="perWeek" className="cursor-pointer">Per Week</label>
                            </div>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perMonth" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perMonth'}/>
                                <label htmlFor="perMonth" className="cursor-pointer">Per Month</label>
                            </div>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perYear" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perYear'} />
                                <label htmlFor="perYear" className="cursor-pointer">Per Year</label>
                            </div>
                        </div>
                    </div>
                )}
                {/* Desk Section Ends */}

                {/* Floor Section Starts */}
                {formData.type === 'floor' && (
                    <div>
                        <p className='font-semibold'>Time Interval:</p>
                        <div className='flex gap-6 flex-wrap'>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perMonth" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perMonth'}/>
                                <label htmlFor="perMonth" className="cursor-pointer">Per Month</label>
                            </div>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perYear" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perYear'} />
                                <label htmlFor="perYear" className="cursor-pointer">Per Year</label>
                            </div>
                        </div>
                    </div>
                )}
                {/* Floor Section Ends */}

                {/* Room Section Starts */}
                {formData.type === 'room' && (
                    <div>
                        <p className='font-semibold'>Time Interval:</p>
                        <div className='flex gap-6 flex-wrap'>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perMonth" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perMonth'}/>
                                <label htmlFor="perMonth" className="cursor-pointer">Per Month</label>
                            </div>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perYear" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perYear'} />
                                <label htmlFor="perYear" className="cursor-pointer">Per Year</label>
                            </div>
                        </div>
                    </div>
                )}
                {/* Room Section Ends */}

                {/* Event Space Section Starts */}
                {formData.type === 'eventSpace' && (
                    <div>
                        <p className='font-semibold'>Time Interval:</p>
                        <div className='flex gap-6 flex-wrap'>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perHour" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perHour'}/>
                                <label htmlFor="perHour" className="cursor-pointer">Per Hour</label>
                            </div>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perDay" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perDay'} />
                                <label htmlFor="perDay" className="cursor-pointer">Per Day</label>
                            </div>
                        </div>
                    </div>
                )}
                {/* Event Space Section Ends */}

                {/* Meeting Room Section Starts*/}
                {formData.type === 'meetingRoom' && (
                    <div>
                        <p className='font-semibold'>Time Interval:</p>
                        <div className='flex gap-6 flex-wrap'>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perHour" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perHour'}/>
                                <label htmlFor="perHour" className="cursor-pointer">Per Hour</label>
                            </div>
                            <div className="flex gap-2">
                                <input type="radio" name="timeIntervalType" id="perDay" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.timeIntervalType === 'perDay'} />
                                <label htmlFor="perDay" className="cursor-pointer">Per Day</label>
                            </div>
                        </div>
                    </div>
                )}
                {/* Meeting Room Section Ends*/}
                {/* Number of Chairs for meeting room, room and event space starts*/}
                {(formData.type === 'meetingRoom' || formData.type === 'room' || formData.type === 'eventSpace') && (
                    <div className='flex items-center gap-2'>
                        <input onChange={handleChange} value={formData.numberOfChairs} type="number" id='numberOfChairs' className='p-3 border border-gray-300 rounded-lg' min='0' max='10000000' required/>
                        <div className='flex flex-col items-center'>
                            {(formData.type === 'meetingRoom' || formData.type === 'room') && (
                                <p>Number of Chairs</p>
                            )}
                            {(formData.type === 'eventSpace') && (
                                <p>Person Availability</p>
                            )}
                        </div>
                    </div>                
                )}
                {/* Number of Chairs for meeting room, room and event space ends*/}
                {/* <p className='font-semibold'>Amenities:</p>
                           <div className='flex gap-6 flex-wrap'>
    {amenitiesList.map((amenity) => (
        <div className="flex gap-2" key={amenity.id}>
              <input type="checkbox" id={amenity.id} className='w-5 cursor-pointer' name={amenity.id} onChange={handleChange} checked={formData.amenities.some((item) => item.name === amenity.id)} />
              <label htmlFor={amenity.id} className='cursor-pointer'>{amenity.label}</label>
        </div>
    ))}
</div> */}

<p className='font-semibold'>Amenities:</p>
                           <div className='flex gap-6 flex-wrap'>
                            
    {amenitiesList.map((amenity) => (
        <div key={amenity.id} className="flex gap-2">
            <input
                type="checkbox"
                id="amenities"
                name={amenity.id}
                className='w-5'
                onChange={handleChange}
                checked={formData.amenities.some((item) => item.name === amenity.id)}
                value={amenity.id}
            />
            <span>{amenity.label}</span>
        </div>
    ))}
    

                            </div>
                            <div className='mt-4'>
                            <p className='font-semibold'>Amenities Pricing:</p>
                            <div className='flex gap-4'>
                                <div className="flex gap-2">
                                    <input type="radio" name="amenitiesPricing" id="fixed" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.amenitiesType === 'fixed'} />
                                    <label htmlFor="fixed" className="cursor-pointer">Fixed</label>
                                </div>
                                <div className="flex gap-2">
                                    <input type="radio" name="amenitiesPricing" id="customize" className='w-5 cursor-pointer' onChange={handleChange} checked={formData.amenitiesType === 'customize'} />
                                    <label htmlFor="customize" className="cursor-pointer">Customize</label>
                                </div>
                            </div>
                            {formData.amenitiesType === 'customize' && (
                                <div className='mt-4'>
                                    {formData.amenities.map((amenity, index) => (
                                        <div key={index} className='flex gap-2 items-center'>
                                            <label htmlFor={`amenity-${amenity.name}`} className='flex-1'>{amenity.name}</label>
                                            <input type="number" id={`amenity-${amenity.name}`} value={amenity.price} onChange={(e) => {
                                                const newPrice = e.target.value;
                                                const updatedAmenities = formData.amenities.map((a, i) => i === index ? { ...a, price: newPrice } : a);
                                                setFormData({ ...formData, amenities: updatedAmenities });
                                            }} className='border p-2 rounded-lg w-24' min='0' />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                <div className='flex flex-wrap gap-6'>
                    <div className='flex items-center gap-2'>
                        <input onChange={handleChange} value={formData.regularPrice} type="number" id='regularPrice' className='p-3 border border-gray-300 rounded-lg' min='50' max='1000000' required/>
                        <div className='flex flex-col items-center'>
                            <p>Regular Price</p>
                            {formData.timeIntervalType === 'perHour' && (
                                <span className='text-xs'>(PKR/hr)</span>
                            )}
                            {formData.timeIntervalType === 'perDay' && (
                                <span className='text-xs'>(PKR/day)</span>
                            )}
                            {formData.timeIntervalType === 'perWeek' && (
                                <span className='text-xs'>(PKR/week)</span>
                            )}
                            {formData.timeIntervalType === 'perMonth' && (
                                <span className='text-xs'>(PKR/month)</span>
                            )}
                            {formData.timeIntervalType === 'perYear' && (
                                <span className='text-xs'>(PKR/year)</span>
                            )}
                        </div>
                    </div>
                    {formData.offer && (
                        <div className='flex items-center gap-2'>
                            <input onChange={handleChange} value={formData.discountPrice} type="number" id='discountPrice' className='p-3 border border-gray-300 rounded-lg' min='0' max='10000000' required/>
                            <div className='flex flex-col items-center'>
                                <p>Discounted Price</p>
                                {formData.type === 'floor' && (
                                    <span className='text-xs'>($ / month)</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className='flex flex-col flex-1 gap-4'>
                <p className='font-semibold '>Images: <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span> </p>
                <div className='flex gap-4'>
                    <input className='p-3 border border-gray-300 rounded w-full' type="file" onChange={(e)=>setFiles(e.target.files)} id='images' accept='image/*' multiple/>
                    <button type='button' disabled={uploading} onClick={handleImageSubmit} className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            <p className="text-red-700 text-sm">{imageUploadError && imageUploadError}</p>
            {
                formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                    <div key={url} className="flex justify-between p-3 border items-center">
                        <img src={url} alt="Listing Image" className="w-20 h-20 object-contain rounded-lg"/>
                        <button type="button" onClick={ () => handleRemoveImage(index)} className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75">Delete</button>
                    </div>
                ))
            }
            <button disabled={loading || uploading} className='p-3 bg-slate-700 text-white rounded-lg hover:opacity-95 disabled:opacity-80 uppercase'>
                        {loading ? 'Creating...' : 'Create Listing'}
                    </button>
                    {error && <p className='text-red-700 text-sm'>{error}</p>}
                </div>
        </form>
    </main>
    </>
  )
}
