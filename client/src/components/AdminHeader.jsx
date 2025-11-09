import React, { useState ,useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { FaInfoCircle, FaHome, FaUser, FaUsers, FaBars ,FaMoon , FaSun} from 'react-icons/fa';
import { useDispatch , useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/Sidebar.css';

function AdminHeader() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    const user = useSelector((state) => state.user.user);
    const role = user?.role;

    const isStaff = role === 'staff';
    const isAdmin = role === 'admin';

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `fw-semibold px-4 nav-link d-flex align-items-center ${isActive ? 'text-black' : 'text-white'}`;

    const dropdownItemClass = 'd-flex align-items-center gap-2';

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        document.body.className = theme === 'dark' ? 'bg-dark text-white' : 'bg-light text-dark';
    }, [theme]);

    const onLinkClick = () => setExpanded(false);

    return (
        <Navbar bg={theme === 'dark' ? 'dark' : undefined} style={theme !== 'dark' ? { backgroundColor: '#2e3a34e3' } : {}} expand="lg" variant="dark" expanded={expanded} className="px-3">
            <Container fluid>
                <Navbar.Brand as={Link} to="/menus">
                    <img src="/logo.png" alt="Logo" style={{ height: '50px', width: '50px', objectFit: 'cover' }} className="me-2" />
                </Navbar.Brand>

                {/* Toggle button for small devices */}
                <Navbar.Toggle onClick={() => setExpanded(prev => !prev)} aria-controls="admin-navbar-nav" />

                <Navbar.Collapse id="admin-navbar-nav">
                    <Nav className="ms-auto align-items-center">

                        <NavLink to="/reservationlist" className={linkClass}>
                            <FaInfoCircle className="me-2" /> Reservations
                        </NavLink>

                        <NavLink to="/allorders" className={linkClass}>
                            <FaBars className="me-2" /> Orders
                        </NavLink>

                        {/* The following links are only visible to admins */}
                        {!isStaff && (
                        <>
                        <NavLink to="/menus" className={linkClass}>
                            <FaInfoCircle className="me-2" /> Menus
                        </NavLink>

                        <NavLink to="/tables" className={linkClass}>
                            <FaInfoCircle className="me-2" /> Tables
                        </NavLink>
    
                        <NavLink to="/allusers" className={linkClass}>
                            <FaUsers className="me-2" /> Users
                        </NavLink>

                        <NavLink to="/staffs" className={linkClass}>
                            <FaUsers className="me-2" /> Staffs
                        </NavLink>
                        </>
                        )}

                        <NavDropdown title={<span className="text-white">{user?.name || 'Account'}</span>} id="admin-nav-dropdown">
                            <NavDropdown.Item as={Link} to="/adminprofile" className={dropdownItemClass}>
                                <FaUser /> Profile
                            </NavDropdown.Item>
                            <NavDropdown.Item onClick={handleLogout} className={dropdownItemClass}>
                                <FaInfoCircle /> Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    <button onClick={toggleTheme} className="btn btn-outline-light ms-3">
                        {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    </button>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default AdminHeader;
