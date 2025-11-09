import React, { useState, useEffect } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaInfoCircle, FaSignOutAlt,FaClipboardList,FaHome, FaUser, FaShoppingCart, FaSun, FaMoon , FaSignInAlt , FaChair ,FaUtensils} from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import { selectCartCount } from '../redux/slices/cartSlice'; 

function Header({ onNameSearch }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const storeUser = useSelector(state => state.user?.user);
  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const user = storeUser || localUser || null;

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const cartCount = useSelector(selectCartCount);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    navigate('/login');
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const linkClass = ({ isActive }) =>
    `px-4 fw-semibold nav-link d-flex align-items-center ${isActive ? 'text-black' : 'text-white'}`;

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark';
  }, [theme]);

  return (
    <>
      <Navbar collapseOnSelect expand="lg" bg={theme === 'dark' ? 'dark' : undefined} style={theme !== 'dark' ? { backgroundColor: '#2e3a34e3' } : {}} className="px-3">
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src="/logo.png" alt="Logo" style={{ height: 60, width: 60, objectFit: 'contain' }} className="me-2" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav" className="justify-content-end">
          <Nav>
            <NavLink to="/" className={linkClass}>
              <FaHome size={15} className="mx-1" /> Home
            </NavLink>

            <NavLink to="/menu" className={linkClass}>
              <FaUtensils size={15} className="mx-1" /> Menu
            </NavLink>

            {user && (
            <>
            <NavLink to="/cart" className={linkClass}>
              <FaShoppingCart size={15} className="mx-1" />
              Cart&nbsp;
              <span className="badge bg-white text-black">{cartCount}</span>
            </NavLink>

            <NavLink to="/reservations" className={linkClass}>
              <FaChair size={15} className="mx-1" />
              Reservations&nbsp;
            </NavLink>

              <NavDropdown title={user.name} id="user-nav-dropdown" className="text-white">
                <NavDropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                  <FaUser size={15} className="mx-1" /> Profile
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders" className="d-flex align-items-center">
                  <FaClipboardList size={15} className="mx-1" /> Orders
                </NavDropdown.Item>
                <NavDropdown.Item onClick={handleLogout} className="d-flex align-items-center">
                  <FaSignOutAlt size={15} className="mx-1" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </>
            )}
            {!user && (
              <NavLink to="/login" className={linkClass}>
                <FaSignInAlt size={15} className="mx-1" /> Login
              </NavLink>
            )}
          </Nav>
          <button onClick={toggleTheme} className="btn btn-outline-light ms-3">
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
        </Navbar.Collapse>
      </Navbar>
    </>
  );
}

export default Header;
