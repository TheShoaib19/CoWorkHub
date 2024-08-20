import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';  
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faPlus, faTimes ,faSave} from '@fortawesome/free-solid-svg-icons';

export default function UpdateCatering() {
    const {currentUser} = useSelector(state => state.user);
    const navigate = useNavigate();
    const id = useParams();
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        address: '',
        area: '',
        serviceType: '',
        menu: '',
        capacity: '',
        imageUrls: [],
        items: [{ name: '', price: '', prices: [{ unit: '', price: '' }], imageUrl: '', isMultiplePrices: false }],
    });
    
    const [isMultiplePrices, setIsMultiplePrices] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageUploadError, setImageUploadError] = useState('');
    const [error, setError] = useState('');
    const lastUploadTimeRef = useRef(Date.now());

    const fetchCateringDetails = async () => {
        try {
            setLoading(true);
            const cateringId = id.cateringId;
            const response = await fetch(`/api/catering/get/${cateringId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch catering details');
            }
            const data = await response.json();
            setFormData(data);
            setLoading(false);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCateringDetails();
    }, [id]);

    const handlePriceChange = (index, e) => {
        const { name, value } = e.target;
        if (name === 'unit') {
            // Update unit and recalculate prices
            const updatedItems = formData.items.map((item, i) =>
                i === index ? { ...item, unit: value } : item
            );
            setFormData(prevData => ({
                ...prevData,
                items: updatedItems
            }));
        } else if (name === 'price') {
            // Recalculate prices based on price input
            const updatedItems = formData.items.map((item, i) => {
                if (i === index) {
                    const calculatedPrices = calculatePrices(index, value);
                    return { ...item, price: value, prices: Object.entries(calculatedPrices).map(([unit, price]) => ({ unit, price })) };
                }
                return item;
            });
            setFormData(prevData => ({
                ...prevData,
                items: updatedItems
            }));
        }
    };

    const fetchFiles = async (filename) => {
        try {
            const response = await fetch(`${filename}`);
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    useEffect(() => {
        const getFileUrls = async () => {
            if (formData.imageUrls.length < 0) {
                try {
                    const promises = formData.imageUrls.map(async (imageUrl) => {
                        const url = await fetchFiles(imageUrl);
                        return url;
                    });
                    const urls = await Promise.all(promises);
                    setFormData(prevData => ({
                        ...prevData,
                        imageUrls: urls
                    }));
                } catch (error) {
                    toast.error(error.message);
                }
            }
        };

        getFileUrls();
    }, [formData.imageUrls]);

    const handleRemoveItemImage = (index) => {
        const updatedItems = formData.items.map((item, i) =>
            i === index ? { ...item, imageUrl: '' } : item
        );
        setFormData(prevData => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    const calculatePrices = (index, value) => {
        const price = parseFloat(value);
        if (isNaN(price)) return {};

        const item = formData.items[index];
        const unit = item.unit;

        const getMultiplier = (unit) => {
            const match = unit.match(/(\d+)\s*(gm|ml|liter)/);
            return match ? parseInt(match[1], 10) : 1;
        };

        const baseUnit = unit.includes('gm') ? 'gm' :
            unit.includes('ml') ? 'ml' :
                unit.includes('liter') ? 'liter' : null;

        if (!baseUnit) return {};

        const multiplier = getMultiplier(unit);
        const basePrice = (price / multiplier);
        const convertedPrices = {};

        if (baseUnit === 'gm') {
            convertedPrices['250 gm'] = basePrice * 250;
            convertedPrices['500 gm'] = basePrice * 500;
            convertedPrices['1 kg'] = basePrice * 1000;
        } else if (baseUnit === 'ml') {
            convertedPrices['250 ml'] = basePrice * 250;
            convertedPrices['500 ml'] = basePrice * 500;
            convertedPrices['1 liter'] = basePrice * 1000;
        } else if (baseUnit === 'liter') {
            convertedPrices['250 ml'] = basePrice * 0.25;
            convertedPrices['500 ml'] = basePrice * 0.5;
            convertedPrices['1 liter'] = basePrice * 1;
        }

        return convertedPrices;
    };

    const handleImageSubmit = async () => {
        if (uploading) return;

        setUploading(true);
        const currentTime = Date.now();
        if (currentTime - lastUploadTimeRef.current < 1000) {
            setUploading(false);
            return; // Ignore if the last submission was less than 1 second ago
        }
        lastUploadTimeRef.current = currentTime;

        const data = new FormData();
        for (let i = 0; i < files.length; i++) {
            data.append('files', files[i]);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload images');
            }

            const responseData = await response.json();

            if (Array.isArray(responseData.fileUrls)) {
                setFormData(prevData => ({
                    ...prevData,
                    imageUrls: [...prevData.imageUrls, ...responseData.fileUrls]
                }));
                toast.success(`${responseData.fileUrls.length} images uploaded successfully!`);
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
        setFormData(prevData => ({
            ...prevData,
            imageUrls: prevData.imageUrls.filter((_, i) => i !== index)
        }));
    };

    const handleFileChange = (e, index) => {
        const file = e.target.files[0];
        const updatedItems = formData.items.map((item, i) =>
            i === index ? { ...item, image: file } : item
        );
        setFormData(prevData => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const updatedItems = formData.items.map((item, i) =>
            i === index ? { ...item, [name]: value } : item
        );
        setFormData(prevData => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', unit: '', price: '', prices: [], imageUrl: '' }]
        });
    };

    const removeItem = (index) => {
        const updatedItems = formData.items.filter((_, i) => i !== index);
        setFormData(prevData => ({
            ...prevData,
            items: updatedItems,
        }));
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value,
        }));
    };
    const uploadItemImage = async (file, index) => {
        if (uploading) return;

        const currentTime = Date.now();
        if (currentTime - lastUploadTimeRef.current < 1000) {
            return; // Ignore if the last submission was less than 1 second ago
        }
        lastUploadTimeRef.current = currentTime;

        const data = new FormData();
        data.append('file', file);
        setUploading(true);
        try {
            const response = await fetch('/api/uploadImageFile', {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to upload item image');
            }

            const responseData = await response.json();

            if (responseData.fileUrl) {
                const updatedItems = formData.items.map((item, i) =>
                    i === index ? { ...item, imageUrl: responseData.fileUrl } : item
                );
                setFormData(prevData => ({
                    ...prevData,
                    items: updatedItems,
                }));
                toast.success('Item image uploaded successfully!');
            } else {
                throw new Error('Invalid response format from server');
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setUploading(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const cateringId = id.cateringId;
            const response = await fetch(`/api/catering/update/${cateringId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update catering');
            }

            toast.success('Catering updated successfully!');
            setLoading(false);
            navigate(`/catering/get/${cateringId}`);
        } catch (error) {
            toast.error(error.message);
            setLoading(false);
        }
    };
    const handleCheckboxChange = (index) => {
        const updatedItems = formData.items.map((item, idx) => {
          if (index === idx) {
            return {
              ...item,
              isMultiplePrices: !item.isMultiplePrices,
              prices: !item.isMultiplePrices ? [{ unit: '', price: '' }] : item.prices,
            };
          }
          return item;
        });
        setFormData((prevData) => ({
          ...prevData,
          items: updatedItems,
        }));
      };
    const handleMultiplePricesChange = (index) => {
        const updatedItems = [...formData.items];
        updatedItems[index].isMultiplePrices = !updatedItems[index].isMultiplePrices;
        setFormData({ ...formData, items: updatedItems });
    };

    const handleAddPriceField = (index) => {
        const updatedItems = [...formData.items];
        updatedItems[index].prices.push({ unit: '', price: '' });
        setFormData({ ...formData, items: updatedItems });
    };

    const handleRemovePriceField = (itemIndex, priceIndex) => {
        const updatedItems = [...formData.items];
        updatedItems[itemIndex].prices.splice(priceIndex, 1);
        setFormData({ ...formData, items: updatedItems });
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <>
            {loading && <Loader />}
            <ToastContainer />
            <main className='p-3 max-w-4xl mx-auto'>
                <h1 className='text-3xl font-semibold text-center my-7'>Update Catering</h1>
                <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
                    <div className='flex flex-col gap-4 flex-1'>
                        <input
                            onChange={handleChange}
                            value={formData.name}
                            type="text"
                            placeholder='Service Provider Name'
                            className='border p-3 rounded-lg'
                            id='name'
                            maxLength='62'
                            minLength='10'
                            required
                        />
                        <textarea
                            onChange={handleChange}
                            value={formData.description}
                            type="text"
                            placeholder='Description'
                            className='border p-3 rounded-lg'
                            id='description'
                            required
                        />
                        <input
                            onChange={handleChange}
                            value={formData.address}
                            type="text"
                            placeholder='Address'
                            className='border p-3 rounded-lg'
                            id='address'
                            required
                        />
                        <div className='flex flex-col gap-4 flex-1'>
                            <select
                                className='border p-3 rounded-lg'
                                id="area"
                                onChange={handleChange}
                                value={formData.area}
                                required
                            >
                                <option value="">Select Area </option>
                                <option value="Tariq Road">Tariq Road</option>
                                <option value="Bahadurabad">Bahadurabad</option>
                                <option value="Defence">Defence</option>
                            </select>
                        </div>
                        <input
                            onChange={handleChange}
                            value={formData.serviceType}
                            type="text"
                            placeholder='Service Type (e.g., Wedding, Corporate)'
                            className='border p-3 rounded-lg'
                            id='serviceType'
                            required
                        />
                        <textarea
                            onChange={handleChange}
                            value={formData.menu}
                            type="text"
                            placeholder='Menu'
                            className='border p-3 rounded-lg'
                            id='menu'
                            required
                        />
                        <input
                            onChange={handleChange}
                            value={formData.capacity}
                            type="number"
                            placeholder='Capacity'
                            className='border p-3 rounded-lg'
                            id='capacity'
                            required
                        />
                    </div>
                    <div className='flex flex-col flex-1 gap-4'>
                        <p className='font-semibold '>Images: <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span> </p>
                        <div className='flex gap-4'>
                            <input
                                className='p-3 border border-gray-300 rounded w-full'
                                type="file"
                                onChange={(e) => setFiles(e.target.files)}
                                id='images'
                                accept='image/*'
                                multiple
                            />
                            <button
                                type='button'
                                disabled={uploading}
                                onClick={handleImageSubmit}
                                className='p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80'
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                        <p className="text-red-700 text-sm">{imageUploadError && imageUploadError}</p>
                        {
                            formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                                <div key={url} className="flex justify-between p-3 border items-center">
                                    <img src={url} alt="Image" className="w-20 h-20 object-contain rounded-lg" />
                                    <button type="button" onClick={() => handleRemoveImage(index)} className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75">Delete</button>
                                </div>
                            ))
                        }
                        <button
                            disabled={loading || uploading}
                            className='p-3 bg-slate-700 text-white rounded-lg hover:opacity-95 disabled:opacity-80 uppercase'
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                        {error && <p className='text-red-700 text-sm'>{error}</p>}
                    </div>
                </form>
                <div className='mt-8'>
      <h2 className='text-2xl font-bold mb-6'>Items</h2>
     
      {formData.items.map((item, index) => (
        <div key={index} className='flex flex-col gap-4 mb-6 border p-4 rounded-lg shadow-sm w-full'>
            <div className="flex items-center gap-2">
              <label htmlFor="MultiplePrices">Multiple Prices</label>
            <input
    type="checkbox"
    id={`isMultiplePrices-${index}`}
    checked={item.isMultiplePrices}
    onChange={() => handleCheckboxChange(index)}
/>
            </div>

          <div className='flex items-center gap-4'>
            <input
              type='text'
              name='name'
              placeholder='Item Name'
              value={item.name}
              onChange={(e) => handleItemChange(index, e)}
              className='border p-3 rounded-lg flex-1'
              required
              minLength="2"
            />
            {item.isMultiplePrices ? (
              <>
                <select
                  name="unit"
                  value={item.unit}
                  onChange={(e) => handlePriceChange(index, e)}
                  className="border p-3 rounded-lg flex-1"
                  required
                >
                  <option value="">Select Unit</option>
                  <option value="250 gm">250 gm</option>
                  <option value="500 gm">500 gm</option>
                  <option value="1 kg">1 kg</option>
                  <option value="250 ml">250 ml</option>
                  <option value="500 ml">500 ml</option>
                  <option value="1 liter">1 liter</option>
                </select>
                <input
                  type='number'
                  name='price'
                  placeholder='Item Price'
                  value={item.price}
                  onChange={(e) => handlePriceChange(index, e)}
                  className='border p-3 rounded-lg flex-1'
                  required
                  min="0.01"
                  step="0.01"
                />
              </>
            ) : (
              <input
                type='number'
                name='price'
                placeholder='Item Price'
                value={item.price}
                onChange={(e) => handleItemChange(index, e)}
                className='border p-3 rounded-lg flex-1'
                required
                min="0.01"
                step="0.01"
              />
            )}
          </div>

          {item.isMultiplePrices && item.prices.length > 0 ? (
            <div className='flex flex-col gap-2'>
              <p><strong>Calculated Prices:</strong></p>
              {item.prices.map(({ unit, price }, idx) => (
                price ? (
                  <div key={idx} className='flex items-center gap-2'>
                    <label className='flex-shrink-0'>{unit}:</label>
                    <input
                      type='text'
                      value={`${price} Rupees`}
                      disabled
                      className='border p-1 rounded'
                    />
                  </div>
                ) : null
              ))}
            </div>
          ) : null}

          <div className='flex items-center gap-4'>
            <input
              type='file'
              name='image'
              onChange={(e) => handleFileChange(e, index)}
              className='border p-3 rounded-lg flex-1'
              accept='image/*'
            />
            <button
              type='button'
              onClick={() => uploadItemImage(formData.items[index].image, index)}
              disabled={uploading}
              className={`p-3 text-green-700 border border-green-700 rounded-lg uppercase hover:bg-green-700 hover:text-white transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? 'Uploading...' : 'Upload'}
              <FontAwesomeIcon icon={faUpload} className="ml-2" />
            </button>
          </div>
          {item.imageUrl && (
            <div className="relative mt-4 w-24 h-24">
              <img src={item.imageUrl} alt="Item" className="w-full h-full object-contain rounded-lg border border-gray-300" />
              <button
                type='button'
                onClick={() => handleRemoveItemImage(index)}
                className='absolute top-0 right-0 p-1 text-red-700 bg-white border border-red-700 rounded-full'
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          )}
          <div className='flex items-center gap-4 mt-4'>
            <button
              type='button'
              onClick={() => removeItem(index)}
              className='relative text-red-600 hover:text-red-800 transition-colors flex items-center p-2 rounded-lg border border-red-600 hover:bg-red-100'
            >
              <FontAwesomeIcon icon={faTrash} className="mr-2" />
              <span className='hidden group-hover:inline absolute left-12 bg-red-100 text-red-600 p-1 rounded-md text-sm whitespace-nowrap'>Delete Item</span>
              Delete Item
            </button>
            {index === formData.items.length - 1 && (
              <button
                type='button'
                onClick={addItem}
                className='relative text-green-600 hover:text-green-800 transition-colors flex items-center p-2 rounded-lg border border-green-600 hover:bg-green-100'
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                <span className='hidden group-hover:inline absolute left-12 bg-green-100 text-green-600 p-1 rounded-md text-sm whitespace-nowrap'>Add Another Item</span>
                Add Another Item
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
     </main>
        </>
    );
}
