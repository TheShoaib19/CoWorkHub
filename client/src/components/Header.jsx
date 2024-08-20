import { FaSearch, FaShoppingCart ,FaUserShield} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Header() {
    const { currentUser } = useSelector(state => state.user);
    const [searchTerm, setSearchTerm] = useState('');
    const [cartItems, setCartItems] = useState([]);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);
    }

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
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        fetchCartItems();
    }, [currentUser]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if (searchTermFromUrl) {
            setSearchTerm(searchTermFromUrl);
        }
    }, [window.location.search]);

    return (
        <header className='bg-slate-200 shadow-md'>
            <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
                <Link to='/'>
                    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
                        <span className='text-slate-500'>Co-Work</span>
                        <span className='text-slate-700'>Hub</span>
                    </h1>
                </Link>
                <form onSubmit={handleSubmit} className='bg-slate-100 p-3 rounded-lg flex items-center'>
                    <input type="text" placeholder='Search...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='bg-transparent focus:outline-none w-24 sm:w-64' />
                    <button>
                        <FaSearch className='text-slate-600' />
                    </button>
                </form>
                <ul className='flex gap-4'>
                    <Link to='/'>
                        <li className='hidden sm:inline text-slate-700 hover:underline'>Home</li>
                    </Link>
                    <Link to='/about'>
                        <li className='hidden sm:inline text-slate-700 hover:underline'>About</li>
                    </Link>
                    <Link to='profile'>
                        {currentUser ? (
                            <img src={currentUser.avatar} alt="Profile" className='rounded-full h-7 w-7 object-cover ' />
                        ) : (
                            <li className='text-slate-700 hover:underline'>Sign in</li>
                        )}
                    </Link>
                    {currentUser && currentUser.role === 'admin' && (
                        <Link to='/admin'>
                            <FaUserShield className='hidden sm:inline text-slate-900 hover:underline' title='Admin Panel' />
                        </Link>
                    )}
                    <div className="relative">
                        <span onClick={() => navigate("/cart")} className="cursor-pointer text-gray-700 hover:text-gray-800 relative">
                            <FaShoppingCart className='hidden sm:inline text-slate-700 hover:underline' />
                            {cartItems.length > 0 && (
                               <span className="absolute top-0 right-0.5 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full px-0.5 py-.5 text-xs">{cartItems.length}</span>
                            )}
                        </span>
                    </div>
                </ul>
            </div>
        </header>
    )
}
