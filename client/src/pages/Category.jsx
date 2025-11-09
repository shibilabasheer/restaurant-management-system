import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { FaConciergeBell } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { fetchMenus, selectMenus, selectMenusLoading } from '../redux/slices/menuSlice';
import {
  addItemServer,
  updateItemServer,
  fetchCart,
  selectCartItems,
} from '../redux/slices/cartSlice';

function Category() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); 

  const menusFromStore = useSelector(selectMenus) || [];
  const loadingMenus = useSelector(selectMenusLoading);

  const cartItems = useSelector(selectCartItems) || [];
  const cartLoading = useSelector(state => state.cart?.loading);

  const [searchText, setSearchText] = useState('');
  const [categoryItems, setCategoryItems] = useState([]);

  const storeUser = useSelector(state => state.user?.user);
  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const user = storeUser || localUser || null;
  const userId = user?.id || user?._id || null;

  useEffect(() => {
    dispatch(fetchMenus());
    if (userId) dispatch(fetchCart()).catch(() => {});
  }, [dispatch, userId]);

  useEffect(() => {
    let list = Array.isArray(menusFromStore) ? menusFromStore : [];
    if (id) {
      list = list.filter(m => String(m.category) === String(id));
    }

    if (searchText) {
      list = list.filter(m => (m.name || '').toLowerCase().includes(searchText.toLowerCase()));
    }
    setCategoryItems(list);
  }, [menusFromStore, id, searchText]);

  const getMenuId = (menu) => menu?._id || menu?.id || null;

  const findExistingCartItem = (menuId) => {
    return cartItems.find(ci => {
      if (!ci) return false;
      const cid = (typeof ci.menu === 'string') ? ci.menu : (ci.menu && (ci.menu._id || ci.menu.id) ? (ci.menu._id || ci.menu.id) : null);
      return cid && String(cid) === String(menuId);
    });
  };

  const handleAddToCart = async (menu) => {
    if (!userId) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const menuId = getMenuId(menu);
    if (!menuId) {
      toast.error('Invalid menu item');
      return;
    }

    const existing = findExistingCartItem(menuId);

    try {
      if (existing) {
        const currentQty = Number(existing.qty || 0);
        const newQty = currentQty + 1;
        const action = await dispatch(updateItemServer({ menuId, qty: newQty }));
        if (action.error) throw action.error;
        toast.success(`${menu.name} quantity updated`);
      } else {
        const action = await dispatch(addItemServer({ menuId, qty: 1, type: 'takeaway' }));
        if (action.error) throw action.error;
        toast.success(`${menu.name} added to cart`);
      }
      dispatch(fetchCart()).catch(() => {});
    } catch (err) {
      console.error('Cart update failed', err);
      const errMsg = err?.payload || err?.message || 'Failed to update cart';
      toast.error(String(errMsg));
      if (String(errMsg).toLowerCase().includes('auth') || String(errMsg).toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  return (
    <Container className="mt-3 mb-2">
      <h3 className="pb-3 text-center">Explore Category</h3>
      <hr />
      <Row className="mb-4 justify-content-center">
        <Col xs={10} sm={8} md={6} lg={4}>
          <input
            type="text"
            className="form-control text-center"
            placeholder="Search Products..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </Col>
      </Row>

      {loadingMenus ? (
        <div className="text-center text-muted">Loading menus...</div>
      ) : categoryItems.length === 0 ? (
        <div className='text-center'>
          <FaConciergeBell size={80} color="gray" className="mb-4" />
          <h3 className="text-muted">No items available in this category</h3>
          <p className="text-secondary">We’re curating the best items for you. Check back soon!</p>
        </div>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {categoryItems.map(menu => {
            const key = menu._id || menu.id;
            const menuId = getMenuId(menu);
            const existing = findExistingCartItem(menuId);
            const existingQty = existing ? Number(existing.qty || 0) : 0;

            return (
              <Col key={key}>
                <Card className="h-100 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={menu.image || '/placeholder.png'}
                    style={{ height: '160px', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title className="mb-0">{menu.name}</Card.Title>
                      {existingQty > 0 && <span className="badge bg-danger">{existingQty}</span>}
                    </div>

                    <Card.Text className="mt-2">{menu.description}</Card.Text>
                    <Card.Text>₹{menu.price}</Card.Text>
                    <Button
                      variant="danger"
                      onClick={() => handleAddToCart(menu)}
                      disabled={!!cartLoading}
                    >
                      {cartLoading ? 'Processing...' : 'Add To Cart'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}

export default Category;
