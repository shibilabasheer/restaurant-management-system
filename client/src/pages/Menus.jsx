import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useSelector, useDispatch } from 'react-redux';
import { FaConciergeBell } from 'react-icons/fa';
import MenuNavbar from '../components/MenuNavbar';

import { fetchMenus, selectMenus, selectMenusLoading } from '../redux/slices/menuSlice';
import {
  addItemServer,
  updateItemServer,
  fetchCart,
  selectCartItems,
} from '../redux/slices/cartSlice'; // server thunks + selector
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

function Menus() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const menusFromStore = useSelector(selectMenus) || [];
  const loadingMenus = useSelector(selectMenusLoading);

  const cartItems = useSelector(selectCartItems) || [];

  const [menus, setMenus] = useState(menusFromStore);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const storeUser = useSelector(state => state.user?.user);
  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const user = storeUser || localUser || null;
  const userId = user?.id || user?._id || null;

  useEffect(() => {
    dispatch(fetchMenus());
    if (userId) {
      dispatch(fetchCart()).catch(() => {});
    }
  }, [dispatch, userId]);

  useEffect(() => {
    let list = Array.isArray(menusFromStore) ? menusFromStore : [];

    if (searchText) {
      list = list.filter(item => (item.name || '').toLowerCase().includes(searchText.toLowerCase()));
    } else if (selectedCategory) {
        //alert(selectedCategory)
      list = list.filter(item => String(item.category) === String(selectedCategory));
    }

    setMenus(list);
  }, [menusFromStore, searchText, selectedCategory]);


  const handleCart = async (menuItem) => {

    if (!userId) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const menuId = menuItem._id || menuItem.id;
    if (!menuId) {
      toast.error('Invalid menu item');
      return;
    }

    const cartItemMenuId = (ci) => {
    if (!ci) return null;
    if (typeof ci.menu === 'string') return ci.menu;
    if (ci.menu && (ci.menu._id || ci.menu.id)) return ci.menu._id || ci.menu.id;
    return ci._id || ci.id || null;
    };

    const existing = cartItems.find(ci => {
      const cid = cartItemMenuId(ci);
      return cid && String(cid) === String(menuId);
    });

    try {
      if (existing) {
        const currentQty = Number(existing.qty || 0);
        const newQty = currentQty + 1;
        const action = await dispatch(updateItemServer({ menuId, qty: newQty }));
        if (action.error) throw action.error;
        toast.success(`${menuItem.name} quantity updated in cart`);
      } else {
        const action = await dispatch(addItemServer({ menuId, qty: 1, type: 'takeaway' }));
        if (action.error) throw action.error;
        toast.success(`${menuItem.name} added to cart`);
      }

      dispatch(fetchCart()).catch(() => {});
    } catch (err) {
      console.error('Cart update failed', err);
    
      const errMsg = err?.payload || err?.message || 'Failed to update cart';
      toast.error(errMsg);
      
      if (String(errMsg).toLowerCase().includes('auth') || String(errMsg).toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  
  const handleNameSearch = (name) => {
    setSearchText(name);
    setSelectedCategory('');
  };

  const handleCategorySearch = (category) => {
    setSelectedCategory(category);
    setSearchText('');
  };

  return (
    <>
      <MenuNavbar onNameSearch={handleNameSearch} onCategorySearch={handleCategorySearch} />

      <Container className="mt-3 mb-5">
        <h3 className="pb-3 text-center">Explore Our Menus</h3>

        {loadingMenus ? (
          <div className="text-center text-muted">Loading menus...</div>
        ) : menus.length === 0 ? (
          <div className='text-center'>
            <FaConciergeBell size={80} color="gray" className="mb-4" />
            <h3 className="text-muted">No Menus Available</h3>
            <p className="text-secondary">We’re curating the best dishes for you. Check back soon!</p>
          </div>
        ) : (
          <Row xs={1} sm={2} md={3} lg={4} className="g-4">
            {menus.map(menu => {
              const key = menu._id || menu.id;
              return (
                <Col key={key}>
                  <Card className="h-100 shadow-sm">
                    <Card.Img
                      variant="top"
                      src={menu.image || '/placeholder.png'}
                      style={{ height: '160px', objectFit: 'cover' }}
                    />
                    <Card.Body>
                      <Card.Title>{menu.name}</Card.Title>
                      <Card.Text>{menu.description}</Card.Text>
                      <Card.Text>₹{menu.price}</Card.Text>
                      <Button variant="danger" onClick={() => handleCart(menu)}>
                        Add To Cart
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </>
  );
}

export default Menus;
