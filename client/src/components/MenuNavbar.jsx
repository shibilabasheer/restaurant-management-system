
import { React, useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { getCategories } from '../helpers/category';

function MenuNavbar({ onNameSearch, onCategorySearch }) {

    const categories = getCategories();

    const [menuName, setMenuName] = useState('');
    const [category, setCategory] = useState('');

    const handleSearchMenuName = (e) => {
        const value = e.target.value;
        setMenuName(value);
        onNameSearch(value);
    };

    const handleSearchMenuCategory = (category) => {
        onCategorySearch(category);
    };

    return (
        <Navbar bg="secondary" data-bs-theme="dark" className="py-2">
            <Container fluid className="d-flex justify-content-between align-items-center flex-wrap">

                <Nav className="flex-wrap">
                    {categories.map((category, index) => (
                        <NavLink
                            className="nav-link px-3 text-white"
                            key={index} onClick={() => handleSearchMenuCategory(category.title)}
                        >
                            {category.title}
                        </NavLink>
                    ))}
                </Nav>

                <Form className="d-flex mt-2 mt-lg-0">
                    <Form.Control
                        type="text"
                        size="md"
                        placeholder="Search menus..."
                        className="ms-lg-3" value={menuName} onChange={handleSearchMenuName}
                    />
                </Form>
            </Container>
        </Navbar>
    )
}

export default MenuNavbar