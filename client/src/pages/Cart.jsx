import React, { useEffect, useState } from 'react';

import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaTrashAlt } from 'react-icons/fa';
import Loader from '../components/Loader';  
import { FaChair, FaWifi, FaSwimmer, FaMapMarkerAlt, FaParking, FaShare, FaCarBattery, FaCamera, FaPray, FaPhone, FaArchive, FaPrint, FaDrumstickBite, FaGamepad, FaWind, FaChartPie, FaRestroom, FaIdCard, FaDumbbell, FaWineBottle, FaMugHot, FaUserShield, FaCouch } from 'react-icons/fa';

const CartPage = () => {
  const { currentUser } = useSelector(state => state.user);
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isCheckoutFormVisible, setIsCheckoutFormVisible] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  // const [startDates, setStartDates] = useState({});
  // const [endDates, setEndDates] = useState({});
  const [startTimes, setStartTimes] = useState({});
  const [startDates, setStartDates] = useState(Array(cartItems.length).fill(''));
const [endDates, setEndDates] = useState(Array(cartItems.length).fill(''));
  const [endTimes, setEndTimes] = useState({});
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  
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

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        const data = await response.json();
        setCartItems(data.items);
        calculateTotalPrice(data.items);
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, [currentUser]);
  const getDefaultDateTime = () => {
    const now = new Date();
    now.setDate(now.getDate() + 1); // Set the date to tomorrow
    return now.toISOString().slice(0, 16); // Format as 'YYYY-MM-DDTHH:MM'
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  const handleDateTimeChangeCatering = (index, cateringName, newDateTime) => {
    console.log('Updating deliveryDateTime for:', cateringName, newDateTime); // Debug log
    setCartItems(prevCartItems =>
      prevCartItems.map((item, i) =>
        i === index
          ? { ...item, deliveryDateTime: newDateTime }
          : item
      )
    );
  };
  
  const handleItemSelection = (cateringName, itemName, price, unit, isChecked) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.type === "catering" && item.catering && item.catering.name === cateringName) {
          // Clone the selectedItems array
          const selectedItems = [...(item.selectedItems || [])];
          
          // Find the index of the item to be updated or removed
          const itemIndex = selectedItems.findIndex(
            (selectedItem) => selectedItem.name === itemName
          );
  
          if (isChecked) {
            if (itemIndex >= 0) {
              // Update the price and unit of the existing selected item
              selectedItems[itemIndex] = { name: itemName, price, unit, selected: true };
            } else {
              // Add the new item to the selectedItems array
              selectedItems.push({ name: itemName, price, unit, selected: true });
            }
          } else if (itemIndex >= 0) {
            // Remove the item from the selectedItems array if unchecked
            selectedItems.splice(itemIndex, 1);
          }
  
          // Return the updated item with modified selectedItems
          return { ...item, selectedItems };
        }
  
        // Return item as is if it doesn't match the cateringName
        return item;
      });
  
      // Trigger total price recalculation
      calculateTotalPrice(updatedItems);
  
      return updatedItems;
    });
  };
  
  
  
  

  const calculateTotalPrice = (items) => {
    if (!Array.isArray(items)) {
      console.error("Expected items to be an array, but got:", items);
      return;
    }
  
    const total = items.reduce((acc, item) => {
      if (item.type === 'listing') {
        // Calculate the total price for the listing items
        const itemTotal = item.quantity * (item.listing.regularPrice || 0);
  
        // Calculate the total price of selected amenities
        const amenitiesTotal = item.selectedAmenities?.reduce((amenityAcc, amenity) => {
          return amenityAcc + Number(amenity.price || 0);
        }, 0) || 0;
  
        return acc + itemTotal + amenitiesTotal;
  
      } else if (item.type === 'catering') {
        // Calculate the total price for selected catering items
        const cateringTotal = item.selectedItems?.reduce((sum, selectedItem) => {
          // Ensure selectedItem.price is a number
          const selectedPrice = Number(selectedItem.price) || 0;
          return sum + (selectedPrice * (selectedItem.quantity || 1));
        }, 0) || 0;
  
        return acc + cateringTotal;
      }
  
      return acc;
    }, 0);
  
    // Format the total price to 2 decimal places
    const formattedTotal = total.toFixed(2);
    setTotalPrice(formattedTotal);
  };
  

  const calculateSubtotal = (item) => {
    if (!item || !item.quantity) {
      return 0;
    }
  
    if (item.type === 'listing') {
      const basePrice = item.quantity * item.listing.regularPrice;
  
      const amenitiesTotal = item.selectedAmenities?.reduce((acc, amenity) => {
        return acc + Number(amenity.price || 0);
      }, 0) || 0;
  
      return basePrice + amenitiesTotal;
    } else if (item.type === 'catering') {
      const cateringTotal = item.selectedItems?.reduce((sum, selectedItem) => {
        // If there's a single price, use it; otherwise, sum up multiple prices
        return sum + (selectedItem.price > 0 ? selectedItem.price : 0);
      }, 0) || 0;
  
      return item.quantity * cateringTotal;
    }
    return 0;
  };
  
  
  const handleTimeChange = (itemId, timeType, time) => {
    if (timeType === 'start') {
      setStartTimes(prevTimes => ({
        ...prevTimes,
        [itemId]: time,
      }));
  
      setEndTimes(prevTimes => ({
        ...prevTimes,
        [itemId]: time,
      }));
    } else if (timeType === 'end') {
      setEndTimes(prevTimes => ({
        ...prevTimes,
        [itemId]: time,
      }));
    }
  };
  const handleProceedToCheckout = async () => {
    const missingDateOrTime = cartItems.some((item, index) => {
      if (item.type === 'listing') {
        return (
          !startDates[index] || 
          !endDates[index] || 
          !startTimes[item._id] || 
          !endTimes[item._id]
        );
      }
      return false;
    });
  
    if (missingDateOrTime) {
      toast.error('Please select start and end date and time for all listings.');
      return;
    }
  
    const itemsToCheck = cartItems.map((item, index) => {
      if (item.type === 'listing') {
        return {
          listing: item.listing._id,
          startDate: startDates[index],
          endDate: endDates[index],
          startTime: startTimes[item._id],
          endTime: endTimes[item._id]
        };
      }
      return null;
    }).filter(item => item !== null);
  
    try {
      const response = await axios.post('/api/check-reservation-overlap', { items: itemsToCheck });

      if (response.status === 200) {
        setShowCheckoutForm(true);
        setIsCheckoutFormVisible(true);
      } else if (response.status === 400) {
        setShowCheckoutForm(false);
        setIsCheckoutFormVisible(false);
        const errorMessage = response.data.message || 'An error occurred while checking reservations.';
        toast.error(errorMessage);
      } else {
        setShowCheckoutForm(false);
        setIsCheckoutFormVisible(false);
        toast.error('An unexpected error occurred.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'An error occurred while checking reservations.');
    }
  };
  
  const handleCheckout = async (formData) => {
    setLoading(true);
  
    const checkoutData = {
      user: currentUser._id,
      items: cartItems.map((item, index) => {
        // Ensure default values are set
        const defaultQuantity = 1;
        const defaultDeliveryDateTime = getDefaultDateTime();
    
        return {
          type: item.type,
          listing: item.type === 'listing' ? item.listing._id : undefined,
          catering: item.type === 'catering' ? {
            ...item.catering,
            selectedItems: item.selectedItems || [], // Ensure selectedItems is always an array
          } : undefined,
          quantity: item.quantity !== undefined ? item.quantity : defaultQuantity, // Set default quantity
          selectedAmenities: item.selectedAmenities || [],
          selectedItems: item.selectedItems || [],
          startDate: item.type === 'listing' ? startDates[index] : null,
          endDate: item.type === 'listing' ? endDates[index] : null,
          startTime: item.type === 'listing' ? startTimes[item._id] : null,
          endTime: item.type === 'listing' ? endTimes[item._id] : null,
          deliveryDateTime: item.type === 'catering' ? (item.deliveryDateTime || defaultDeliveryDateTime) : null, // Set default deliveryDateTime
        };
      }),
    
      totalPrice: parseFloat(totalPrice) || 0, // Ensure totalPrice is a number
      address: formData.address || '',
      paymentMethod: formData.paymentMethod || '',
      cardNumber: formData.cardNumber || '',
      cvv: formData.cvv || '',
      expiryDate: formData.expiryDate || '',
      jazzCashMobile: formData.jazzCashMobile || '',
    };
    
    console.log(checkoutData);
    
    

    console.log(checkoutData);
    if (formData.paymentMethod === 'jazzcash') {
      try {
        const response = await axios.post('/api/jazzcash/initiate', checkoutData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
  
        const { paymentUrl } = response.data;
        window.location.href = paymentUrl;
      } catch (error) {
        
        const errorMessage = error?.response?.data?.message || 'Failed to initiate JazzCash payment.';
        toast.error(errorMessage);
        console.error('Error initiating JazzCash payment:', error);
      }
      finally {
        setLoading(false);
      }
    } 
    else {
    }
    try {
      const response = await axios.post('/api/checkout', checkoutData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const errorMessage = response?.data?.message || 'Order placed successfully!';
      toast.success(errorMessage);

      try {
        // Clear the cart
        await axios.post('/api/cart/clear', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
      } catch (clearCartError) {
        console.error('Error clearing the cart:', clearCartError);
        toast.error('Failed to clear the cart. Please try again.');
        return;
      }

      //Redirect to confirmation page
       navigate('/order-confirmation', { replace: true });
       window.location.reload(); // Reload the page
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'Failed to place the order.';
      toast.error(errorMessage);
    
    // console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  
  };
  const handleRemoveFromCart = async (item) => {
    try {
      const isInCartResponse = await axios.post('/api/cart/check', { listingId: item.listing._id });
      if (isInCartResponse.data.isInCart) {
        const removeResponse = await axios.post('/api/cart/remove', { listingId: item.listing._id });
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
  const handleQuantityChange = (cateringName, itemName, newQuantity) => {
    setCartItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.type === 'catering' && item.catering && item.catering.name === cateringName) {
          const updatedSelectedItems = item.selectedItems.map((selectedItem) => {
            if (selectedItem.name === itemName) {
              // Ensure quantity is a positive number
              const quantity = Math.max(parseInt(newQuantity, 10), 1);
              return { ...selectedItem, quantity };
            }
            return selectedItem;
          });
  
          return { ...item, selectedItems: updatedSelectedItems };
        }
        return item;
      });
  
      // Trigger total price recalculation
      calculateTotalPrice(updatedItems);
  
      return updatedItems;
    });
  };
  const handleRemoveCateringFromCart = async (item) => {
    try {
      // Ensure item and item.catering are defined and have the required _id property
      if (!item || !item.catering ) {
        throw new Error("Invalid item data. Unable to remove from cart.");
      }

      const isInCartResponse = await axios.post('/api/cart/check', { CateringId: item.catering._id });
      if (isInCartResponse.data.isInCart) {
        // Remove the item from the cart
        const removeResponse = await axios.post('/api/cart/remove', { CateringId : item.catering._id});
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
  const handleAmenityToggle = (itemId, amenity) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => {
        if (item._id === itemId && item.type === 'listing') {
          const selectedAmenities = item.selectedAmenities || [];
          if (selectedAmenities.some(selectedAmenity => selectedAmenity.name === amenity.name)) {
            return {
              ...item,
              selectedAmenities: selectedAmenities.filter(selectedAmenity => selectedAmenity.name !== amenity.name),
            };
          } else {
            return {
              ...item,
              selectedAmenities: [...selectedAmenities, amenity],
            };
          }
        }
        return item;
      });
  
      // Calculate the total price with the updated items
      calculateTotalPrice(updatedItems);
      return updatedItems;
    });
  };

  const handleDateChange = (index, itemId, date) => {
    setStartDates(prevDates => {
      const updatedDates = [...prevDates];
      updatedDates[index] = date;
      return updatedDates;
    });
  
    const item = cartItems[index];
    
    if (item && item.type === 'listing') {
      const listing = item.listing;
      let endDate;
      const startDate = new Date(date);
  
      if (listing.timeIntervalType === 'perMonth') {
        endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
      } else if (listing.timeIntervalType === 'perWeek') {
        endDate = new Date(startDate.setDate(startDate.getDate() + 7));
      } else if (listing.timeIntervalType === 'perDay') {
        endDate = new Date(startDate.setDate(startDate.getDate() + 1));
      } else if (listing.timeIntervalType === 'perYear') {
        endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
      } else if (listing.timeIntervalType === 'perHour') {
        endDate = new Date(startDate.setHours(startDate.getHours() + 1));
      }
  
      if (endDate) {
        setEndDates(prevDates => {
          const updatedDates = [...prevDates];
          updatedDates[index] = endDate.toISOString().split('T')[0];
          return updatedDates;
        });
      }
    }
    // Hide the checkout form if it was previously shown
  if (isCheckoutFormVisible) {
    setShowCheckoutForm(false);
    setIsCheckoutFormVisible(false); // Update the state to reflect the form is hidden
  }
  };
  if (loading) return <Loader />;
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
<div className="max-w-6xl mx-auto p-8 bg-white shadow-md rounded-md">
     
     <ToastContainer />
     {loading && <Loader />}
     <h1 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h1>
     
     {cartItems.length === 0 ? (
  <p className="text-gray-600 text-center">Your cart is empty.</p>
) : (
  <div className="space-y-6">
    {cartItems.map((item, index) => (
      
      <div key={item._id} className="cart-item">
        <h2>{item.type === 'listing' ? item.listing.title : item.catering.title}</h2>
        {item.type === 'listing' && (
          <div key={item._id} className="flex items-start justify-between border-b border-gray-200 py-4">
            <div className="space-y-2 w-3/4">
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-gray-700">{index + 1}.</p>
                <h3 className="text-xl font-semibold">{item.listing.name}</h3>
              </div>
              <p className="text-gray-700">Price: {item.listing.regularPrice.toFixed(2)} Rupees</p>
              <p className="text-gray-700">Description: {item.listing.description}</p>
              <p className="text-gray-700">Quantity: {item.quantity}</p>
              <p className="text-gray-700">Interval Type: {item.listing.timeIntervalType}</p>
              <p className="text-gray-700">Subtotal: {calculateSubtotal(item).toFixed(2)} Rupees</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <label className="text-gray-700 font-medium">Start Date: </label>
                  <input
                    type="date"
                    min={getCurrentDate()}
                    value={startDates[index] || ''}
                    onChange={(e) => handleDateChange(index, item._id, e.target.value)}
                    className="ml-2 border rounded-md p-1"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <label className="text-gray-700 font-medium">Start Time: </label>
                  <input
                    type="time"
                    value={startTimes[item._id] || ''}
                    onChange={(e) => handleTimeChange(item._id, 'start', e.target.value)}
                    className="ml-2 border rounded-md p-1"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
  <label className="text-gray-700 font-medium">End Date: </label>
  <input
    type="date"
    min={getCurrentDate()}
    value={endDates[index] || ''}
    className="ml-2 border rounded-md p-1"
    disabled
    required
  />
</div>
                <div className="flex items-center">
                  <label className="text-gray-700 font-medium">End Time: </label>
                  <input
                    type="time"
                    value={endTimes[item._id] || ''}
                    onChange={(e) => handleTimeChange(item._id, 'end', e.target.value)}
                    className="ml-2 border rounded-md p-1"
                    disabled
                    required
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium">Amenities:</p>
                <ul className="text-gray-800 font-semibold text-sm flex flex-wrap items-center gap-4">
                  {item.listing.amenities.map((amenity, index) => {
                    const Icon = iconMap[amenity.name];
                    const isSelected = item.selectedAmenities?.some(
                      (selectedAmenity) => selectedAmenity.name === amenity.name
                    );
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
                                onChange={() => handleAmenityToggle(item._id, amenity)}
                                className="ml-2"
                              />
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
            <button
              onClick={() => handleRemoveFromCart(item)}
              className="text-red-500 hover:text-red-700 text-lg"
            >
              <FaTrashAlt />
            </button>
          </div>
        )}
{item.type === 'catering' && (
  <div className="flex flex-col space-y-6 p-6 border-b border-gray-200 bg-white shadow-md rounded-lg">
    <div className="flex items-center justify-between border-b border-gray-300 pb-4 mb-4">
      <div className="flex items-center gap-4">
        <p className="text-lg font-bold text-gray-700">{index + 1}.</p>
        <h3 className="text-2xl font-semibold text-gray-800">{item.catering.name}</h3>
      </div>
      <button
        onClick={() => handleRemoveCateringFromCart(item)}
        className="text-red-600 hover:text-red-800 text-xl"
      >
        <FaTrashAlt />
      </button>
    </div>

    <div>
      <p className="text-gray-700 font-medium mb-4">Items:</p>
      <ul className="text-gray-800 font-semibold text-sm flex flex-col gap-6">
        {item.catering.items.map((cateringItem, cateringItemIndex) => {
          const selectedItem = item.selectedItems?.find(
            (selectedItem) => selectedItem.name === cateringItem.name
          );
          const selectedPrice = selectedItem?.price;
          const hasSinglePrice = cateringItem.price && parseFloat(cateringItem.price) > 0;

          return (
            <li key={cateringItemIndex} className="flex flex-col gap-4 p-4 border border-gray-300 rounded-lg">
              <div className="flex items-start gap-4">
                {cateringItem.imageUrl ? (
                  <img
                    src={cateringItem.imageUrl}
                    alt={cateringItem.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                ) : (
                  <span className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-md text-gray-500">No Image</span>
                )}
                <div className="flex flex-col flex-grow">
                  <span className="text-lg font-semibold">{cateringItem.name}</span>
                  {hasSinglePrice ? (
                    <span className="text-gray-600 text-sm">
                      Price: {parseFloat(cateringItem.price).toFixed(2)} Rupees
                    </span>
                  ) : (
                    cateringItem.prices.length > 0 && cateringItem.prices.map((price, priceIndex) => (
                      <label key={`${cateringItemIndex}-${priceIndex}`} className="text-gray-600 text-sm flex items-center gap-2">
                        <input
                          type="radio"
                          name={`price-${cateringItemIndex}`}  // Group radio buttons by cateringItemIndex
                          value={price.price}
                          checked={selectedPrice === price.price}  // Correctly compare selected price
                          onChange={() =>
                            handleItemSelection(item.catering.name, cateringItem.name, price.price, price.unit, true)
                          }
                          className="mr-2"
                        />
                        {price.unit ? `${price.unit}: ` : ''}
                        {price.price ? `${price.price} Rupees` : 'Not Available'}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">Quantity:</p>
                  <input
                    type="number"
                    min="1"
                    value={selectedItem?.quantity || 1}  // Default to 1 if quantity is undefined
                    onChange={(e) => handleQuantityChange(item.catering.name, cateringItem.name, e.target.value)}
                    className="border border-gray-300 rounded p-2 w-20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600">Select:</p>
                  <input
                    type="checkbox"
                    checked={selectedItem !== undefined}
                    onChange={() => {
                      if (selectedItem) {
                        // Deselect the item
                        handleItemSelection(
                          item.catering.name || '',
                          cateringItem.name,
                          null,
                          null,
                          false // Pass false to indicate the item is being unchecked
                        );
                      } else {
                        // Select the item with default or first available price
                        const defaultPrice = hasSinglePrice
                          ? cateringItem.price
                          : (cateringItem.prices[0]?.price || 0);
                        handleItemSelection(
                          item.catering.name || '',
                          cateringItem.name,
                          defaultPrice,
                          cateringItem.prices[0]?.unit || '',
                          true // Pass true to indicate the item is being checked
                        );
                      }
                    }}
                    className="mr-2"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
    <input
  id={`deliveryDateTime`}
  type="datetime-local"
  value={item.deliveryDateTime || getDefaultDateTime()}
  min={minDateTime}
  onChange={(e) => handleDateTimeChangeCatering(index, item.catering.name, e.target.value)}
  className="border border-gray-300 rounded p-2"
  required
/>


  </div>
)}






      </div>
    ))}
    <div className="text-right">
      <h2>Total Price: {totalPrice} Rupees</h2>
      <button
        onClick={handleProceedToCheckout}
        className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg mt-4 hover:bg-blue-700"
      >
        Proceed to Checkout
      </button>
    </div>
  </div>
)}


       {showCheckoutForm && <CheckoutForm handleCheckout={handleCheckout} totalPrice ={totalPrice }/>}
     
    </div>
  );
};
const CheckoutForm = ({ handleCheckout ,totalPrice }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [formData, setFormData] = useState({
    address: '',
    paymentMethod: 'stripe', // default payment method
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    jazzCashMobile: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!stripe || !elements) {
      return;
    }
  
    if (formData.paymentMethod === 'stripe') {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
    
      if (error) {
        toast.error(error.message);
        return;
      }
    
      // Adding totalPrice and currency to the form data before sending it
      const checkoutData = {
        ...formData,
        paymentMethodId: paymentMethod.id,
        totalPrice: totalPrice, // Total price in the smallest currency unit (paisa for PKR)
        currency: 'pkr',
      };
    
      try {
        // Make the POST request to your server
        const response = await axios.post('/api/stripe/payment', checkoutData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Include the access token in the headers
            'Content-Type': 'application/json', // Ensure the content type is set to JSON
          },
        });
    
        // Extract the client secret from the response
        const { clientSecret } = response.data;
    
        // Confirm the card payment
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });
    
        if (stripeError) {
          toast.error(stripeError.message);
        } else if (paymentIntent.status === 'succeeded') {
          toast.success('Payment successfully Done');
          // Update formData with payment status and paymentIntent details
          const updatedFormData = {
            ...formData,
            paymentIntentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
          };
          handleCheckout(updatedFormData); // Pass updatedFormData to handleCheckout after successful payment
        } else {
          toast.error('Payment failed');
        }
      } catch (error) {
        // Show response error message when payment fails
        if (error.response && error.response.data && error.response.data.error) {
          toast.error(error.response.data.error);
        } else {
          toast.error(error.message);
        }
        // console.error('Payment error:', error);
      }
    } else {
      // For non-Stripe payment methods, handle accordingly
      handleCheckout(formData);
    }
    
  };

  return (
    
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
     
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="border rounded-md p-2"
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="text-gray-700 font-medium">Payment Method</label>
        <select
          name="paymentMethod"
          value={formData.paymentMethod}
          onChange={handleInputChange}
          className="border rounded-md p-2"
          required
        >
          <option value="stripe">Card Payment</option>
          {/* <option value="debitCard">Debit Card</option>
          <option value="paypal">PayPal</option>
          <option value="jazzcash">JazzCash</option> Added JazzCash option */}
        </select>
      </div>
      {formData.paymentMethod === 'stripe' && (
        <div className="mb-4">
          <label className="block text-gray-700">Card Details</label>
          <CardElement className="w-full border rounded-md p-2" />
        </div>
      )}
        {formData.paymentMethod === 'jazzcash' && (
        <div className="flex flex-col">
          <label className="text-gray-700 font-medium">JazzCash Mobile Number</label>
          <input
            type="text"
            name="jazzCashMobile"
            value={formData.jazzCashMobile}
            onChange={handleInputChange}
            className="border rounded-md p-2"
            required
          />
        </div>
      )}
  
  <button type="submit"className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700" disabled={!stripe || !elements}>Pay Now</button>
      {/* <button
        type="submit"
        className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
      >
        Pay Now
      </button> */}
      
    </form>
    
  );
};

export default CartPage;