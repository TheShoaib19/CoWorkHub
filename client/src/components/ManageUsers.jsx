import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faSave, faTimes, faDownload } from '@fortawesome/free-solid-svg-icons';
import ReactPaginate from 'react-paginate';
import { toast, ToastContainer } from 'react-toastify';
import Modal from 'react-modal';
import debounce from 'lodash.debounce';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../components/Loader';

// Set the app element for accessibility
Modal.setAppElement('#root');

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [updatedUserData, setUpdatedUserData] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [usersPerPage] = useState(5);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/users', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                });
    
                const usersWithDetails = [];
                for (const user of response.data) {
                    try {
                        const userDetailsResponse = await axios.get(`/api/users/${user._id}`, {
                            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                        });
                        usersWithDetails.push(userDetailsResponse.data);
                    } catch (error) {
                        console.error(`Failed to fetch details for user ${user._id}: ${error.message}`);
                    }
                }
    
                setUsers(usersWithDetails);
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/api/uploadImageFile', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setUpdatedUserData({ ...updatedUserData, avatar: data.fileUrl });
                } else {
                    console.error('Failed to upload avatar');
                }
            } catch (error) {
                console.error('Error uploading avatar:', error);
            }
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/users/delete/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            setUsers(users.filter(user => user._id !== id));
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setUpdatedUserData(user);
    };

    const handleUpdate = async () => {
        try {
            setLoading(true);
            const response = await axios.put(`/api/users/update/${editingUser._id}`, updatedUserData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            setUsers(users.map(user => user._id === editingUser._id ? { ...user, ...updatedUserData } : user));
            setEditingUser(null);
            setUpdatedUserData({});
            toast.success(response.data.message || 'User updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUserData({ ...updatedUserData, [name]: name === 'verified' ? parseInt(value, 10) : value });
    };

    const handleSearchChange = debounce((value) => {
        setSearchTerm(value);
    }, 300);

    useEffect(() => {
        setCurrentPage(0); // Reset page when search term changes
    }, [searchTerm]);

    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
    };

    const handleDownloadDocument = async (userId, documentId) => {
        try {
            const response = await axios.get(`/api/users/${userId}/documents/${documentId}`, {
                responseType: 'blob',
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `document_${userId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to download document');
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.verified.toString().includes(searchTerm)
    );

    const offset = currentPage * usersPerPage;
    const currentPageData = filteredUsers.slice(offset, offset + usersPerPage);
    const pageCount = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="module-content">
            <ToastContainer />
            {loading ? (
                <Loader />
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : (
                <>
                    <input
                        type="text"
                        placeholder="Search by username, email, or status"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="search-input"
                    />
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Verified</th>
                                <th>Document</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageData.map(user => (
                                <tr key={user._id}>
                                    <td>{user.username}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>
                                        {user.verified === 1 ? 'Active' : user.verified === 2 ? 'Fail' : 'Pending'}
                                    </td>
                                    <td>
                                        {user.document ? (
                                            <button className="download-btn" onClick={() => handleDownloadDocument(user._id, user.document)}>
                                                <FontAwesomeIcon icon={faDownload} /> Download
                                            </button>
                                        ) : (
                                            <span>No document</span>
                                        )}
                                    </td>
                                    <td>
                                        <button className="edit-btn" onClick={() => handleEdit(user)}>
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        <button className="delete-btn" onClick={() => handleDelete(user._id)}>
                                            <FontAwesomeIcon icon={faTrash} /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <ReactPaginate
                        previousLabel={'previous'}
                        nextLabel={'next'}
                        breakLabel={'...'}
                        breakClassName={'break-me'}
                        pageCount={pageCount}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={'pagination'}
                        subContainerClassName={'pages pagination'}
                        activeClassName={'active'}
                    />
                    <Modal
                        isOpen={!!editingUser}
                        onRequestClose={() => setEditingUser(null)}
                        contentLabel="Edit User"
                        className="edit-modal"
                        overlayClassName="edit-modal-overlay"
                    >
                        <FontAwesomeIcon icon={faTimes} className="close-icon" onClick={() => setEditingUser(null)} />
                        <div className="modal-content">
                            <h2>Update User Profile</h2>
                            <img
                                src={updatedUserData.avatar || 'default-avatar.png'}
                                alt="User Avatar"
                                className="avatar-preview"
                                onClick={() => document.getElementById('avatarUpload').click()}
                                style={{ cursor: 'pointer' }}
                            />
                            <input
                                type="file"
                                id="avatarUpload"
                                name="avatar"
                                onChange={handleAvatarChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="username">Username:</label>
                            <input type="text" id="username" name="username" value={updatedUserData.username || ''} onChange={handleInputChange} />
                            <label htmlFor="email">Email:</label>
                            <input type="email" id="email" name="email" value={updatedUserData.email || ''} onChange={handleInputChange} />
                            <label htmlFor="password">Password:</label>
                            <input type="password" id="password" name="password" value={updatedUserData.password || ''} onChange={handleInputChange} />
                            <label htmlFor="role">Role:</label>
                            <input type="text" id="role" name="role" value={updatedUserData.role || ''} onChange={handleInputChange} />
                            <label htmlFor="verified">Verified:</label>
                            <select id="verified" name="verified" value={updatedUserData.verified} onChange={handleInputChange}>
                                <option value={0}>Pending</option>
                                <option value={1}>Active</option>
                                <option value={2}>Fail</option>
                            </select>
                            <button className="update-btn" onClick={handleUpdate}>
                                <FontAwesomeIcon icon={faSave} /> Update
                            </button>
                            <button className="cancel-btn" onClick={() => setEditingUser(null)}>
                                <FontAwesomeIcon icon={faTimes} /> Cancel
                            </button>
                        </div>
                    </Modal>
                </>
            )}
        </div>
    );
};

export default ManageUsers;
