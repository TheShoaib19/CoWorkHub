import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ManageUsers from './ManageUsers';
import ManageOrders from './ManageOrders';
import ManageCateringOrders from './ManageCateringOrders'; // Import the new component
import './AdminDashboard.css'; // Ensure the path is correct

const AdminDashboard = () => {
    const [selectedModule, setSelectedModule] = useState('manageUsers');

    const renderModule = () => {
        switch (selectedModule) {
            case 'manageUsers':
                return <ManageUsers />;
                case 'orders':
                    return <ManageOrders />;  
            // case 'manageCateringOrders': // Add case for the new component
            //     return <ManageCateringOrders />;
            default:
                return <div className="module-content">Select a module</div>;
        }
    };

    return (
        <div className="admin-dashboard">
            <Sidebar setModule={setSelectedModule} />
            <div className="dashboard-content">
                {renderModule()}
            </div>
        </div>
    );
};

export default AdminDashboard;
