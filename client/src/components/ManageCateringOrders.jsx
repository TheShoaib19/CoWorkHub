import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactPaginate from 'react-paginate';
import Modal from 'react-modal';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import debounce from 'lodash.debounce';

// Set the app element for accessibility
Modal.setAppElement('#root');

const ManageCateringOrders = () => {
    const [orders, setOrders] = useState([]);
    const [cateringItems, setCateringItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPageOrders, setCurrentPageOrders] = useState(0);
    const [ordersPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersResponse = await axios.get('/api/orders', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
                
                const cateringIds = ordersResponse.data
                    .flatMap(order => order.items)
                    .filter(item => item.type === 'catering')
                    .map(item => item.catering);

                await fetchCateringDetails(cateringIds);

                const ordersWithDetails = await Promise.all(ordersResponse.data.map(async (order) => {
                    try {
                        const userResponse = await axios.get(`/api/users/${order.user}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                        });

                        const itemsWithDetails = await Promise.all(
                            order.items.map(async (item) => {
                                if (item.type === 'catering') {
                                    const catering = cateringItems.find(catering => catering._id === item.catering);
                                    return { ...item, catering };
                                }
                                return item;
                            })
                        );

                        return { ...order, user: userResponse.data, items: itemsWithDetails };
                    } catch (error) {
                        console.error(`Failed to fetch details for order ${order._id}: ${error.message}`);
                        return order;
                    }
                }));

                setOrders(ordersWithDetails);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch orders');
            } finally {
                setLoading(false);
            }
        };

        const fetchCateringDetails = async (cateringIds) => {
            try {
                const cateringResponses = await Promise.all(
                    cateringIds.map(id => axios.get(`/api/catering/get/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                    }))
                );
                const cateringData = cateringResponses.map(response => response.data);
                setCateringItems(cateringData);
            } catch (error) {
                console.error('Failed to fetch catering details:', error.message);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
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
            item.type === 'catering' &&
            item.catering && 
            item.catering.items.some(selectedItem => 
                selectedItem.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
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
                            placeholder="Search orders..."
                            onChange={handleSearchChange}
                            className="search-input"
                        />
                    </div>

                    {/* Catering Orders Table */}
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Items</th>
                                <th>Deleviery Date Time</th>
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
                                                item.type === 'catering' && item.catering && (
                                                    <li key={item._id}>
                                                        {item.catering.name}
                                                        <ul>
                                                            {item.catering.items.map(selectedItem => (
                                                                <li key={selectedItem._id}>
                                                                    {selectedItem.name} - {selectedItem.prices.map(price => (
                                                                        <span key={price._id}>{price.unit}: {price.price} </span>
                                                                    ))}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </li>
                                                )
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        <ul>
                                            {order.items.map(item => (
                                                item.type === 'catering' && (
                                                    <li key={item._id}>
                                                       { formatDate(item.deliveryDateTime)}
                                                    </li>
                                                )
                                            ))}
                                        </ul>
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

export default ManageCateringOrders;
