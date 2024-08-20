import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css'; // Assuming you have a CSS file for styling

const Sidebar = ({ setModule }) => {
    return (
        <div className="sidebar">
            <h2>Dashboard</h2>
            <ul>
                <li onClick={() => setModule('manageUsers')}>
                    <FontAwesomeIcon icon={faUser} className="icon" />
                    Manage Users
                </li>
                <li onClick={() => setModule('orders')}>
                    <FontAwesomeIcon icon={faShoppingCart} className="icon" />
                    Manage Orders
                </li>
                {/* <li onClick={() => setModule('manageCateringOrders')}>
                    <FontAwesomeIcon icon={faShoppingCart} className="icon" />
                    Manage Catering Orders
                </li> */}
                {/* Add more modules as needed */}
            </ul>
        </div>
    );
};

export default Sidebar;
