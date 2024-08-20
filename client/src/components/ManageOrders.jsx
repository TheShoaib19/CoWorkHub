import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';

// Set the app element for accessibility
Modal.setAppElement('#root');

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPageOrders, setCurrentPageOrders] = useState(0);
    const [ordersPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('/api/orders', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                setOrders(response.data);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const handleSearchChange = useCallback(debounce((e) => {
        setSearchTerm(e.target.value);
    }, 300), []);

    useEffect(() => {
        setCurrentPageOrders(0); // Reset page when search term changes
    }, [searchTerm]);

    const handleOrderPageClick = ({ selected }) => {
        setCurrentPageOrders(selected);
    };

    const filteredOrders = orders.filter(order => 
        order.items.some(item => 
            (item.catering && 
            item.catering.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.listing && 
            item.listing.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    const offsetOrders = currentPageOrders * ordersPerPage;
    const currentPageOrdersData = filteredOrders.slice(offsetOrders, offsetOrders + ordersPerPage);
    const pageCountOrders = Math.ceil(filteredOrders.length / ordersPerPage);

    return (
        <div className="module-content">
            <ToastContainer />
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <>
                    <div className="search-controls">
                        <input
                            type="text"
                            placeholder="Search caterings and listings..."
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    {/* Orders Table */}
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Items</th>
                                <th>Date/Time</th>
                                <th>Total Price</th>
                                <th>Address</th>
                                <th>Payment Method</th>
                                <th>Card Number</th>
                                <th>CVV</th>
                                <th>Expiry Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageOrdersData.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.user.username}</td>
                                    <td>
                                        <ul>
                                            {order.items.map(item => (
                                                <li key={item._id}>
                                                    {item.catering && (
                                                        <>
                                                            <strong>Catering: </strong>
                                                            {item.catering.name}
                                                            <ul>
                                                                {item.selectedItems.map(selectedItem => (
                                                                    <li key={selectedItem._id}>
                                                                        {selectedItem.name} - {selectedItem.price} {selectedItem.unit} (Quantity: {selectedItem.quantity ||1})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </>
                                                    )}
                                                    {item.listing && (
                                                        <>
                                                            <strong>Listing: </strong>
                                                            {item.listing.name}
                                                            <ul>
                                                                <li>
                                                                DateTime: {formatDate(item.startDate)} {item.startTime} to {formatDate(item.endDate) } {item.endTime}
                                                                </li>
                                                            </ul>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        {order.items.map(item => {
                                            if (item.catering) {
                                                return `Catering Delivery: ${formatDateTime(item.deliveryDateTime)}`;
                                            }
                                            if (item.listing) {
                                                return `Listing Date: ${formatDate(item.startDate)} ${item.startTime} to ${formatDate(item.endDate)} ${item.endTime}`;
                                            }
                                            return 'N/A';
                                        }).join(', ')}
                                    </td>
                                    <td>{order.totalPrice}</td>
                                    <td>{order.address}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>{order.cardNumber}</td>
                                    <td>{order.cvv}</td>
                                    <td>{order.expiryDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <ReactPaginate
                        pageCount={pageCountOrders}
                        onPageChange={handleOrderPageClick}
                        containerClassName={'pagination'}
                        activeClassName={'active'}
                    />
                </>
            )}
        </div>
    );
};

export default ManageOrders;
