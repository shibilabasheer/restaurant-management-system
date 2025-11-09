import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Container from 'react-bootstrap/Container';
import { FaShoppingCart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { Image } from "react-bootstrap";
import {
  fetchCart,
  updateItemServer,
  removeItemServer,
  clearCartServer,
  selectCartItems,
  selectCartCount,
} from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storeUser = useSelector(state => state.user?.user);
  const localUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const user = storeUser || localUser || null;
  const userId = user?.id || user?._id || null;

  const items = useSelector(selectCartItems) || [];
  const cartCount = useSelector(selectCartCount) || 0;

  const total = useMemo(() => {
    return items.reduce((sum, it) => {
      const price = Number(it.price || 0);
      const qty = Number(it.qty ?? 0);
      return sum + price * qty;
    }, 0);
  }, [items]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchCart()).catch(() => {});
    }
  }, [dispatch, userId]);

  const getMenuId = (cartItem) => {
    if (!cartItem) return null;
    if (typeof cartItem.menu === 'string') return cartItem.menu;
    if (cartItem.menu && (cartItem.menu._id || cartItem.menu.id)) return cartItem.menu._id || cartItem.menu.id;
    return cartItem.menuId || cartItem._id || cartItem.id || null;
  };

  const getQty = (cartItem) => Number(cartItem?.qty ?? 0);

  const handleAdd = async (cartItem) => {
    if (!userId) {
      toast.info('Please login to modify cart');
      navigate('/login');
      return;
    }
    const menuId = getMenuId(cartItem);
    if (!menuId) {
      toast.error('Invalid cart item');
      return;
    }
    const newQty = getQty(cartItem) + 1;
    try {
      const action = await dispatch(updateItemServer({ menuId, qty: newQty }));
      if (action.error) throw action.error;
      toast.success('Quantity updated');
      dispatch(fetchCart()).catch(() => {});
    } catch (err) {
      console.error('update failed', err);
      const msg = err?.payload || err?.message || 'Failed to update cart';
      toast.error(String(msg));
      if (String(msg).toLowerCase().includes('auth') || String(msg).toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleRemoveOne = async (cartItem) => {
    if (!userId) {
      toast.info('Please login to modify cart');
      navigate('/login');
      return;
    }
    const menuId = getMenuId(cartItem);
    if (!menuId) {
      toast.error('Invalid cart item');
      return;
    }
    const currentQty = getQty(cartItem);
    try {
      if (currentQty <= 1) {
        const action = await dispatch(removeItemServer({ menuId }));
        if (action.error) throw action.error;
        toast.info('Item removed from cart');
      } else {
        const action = await dispatch(updateItemServer({ menuId, qty: currentQty - 1 }));
        if (action.error) throw action.error;
        toast.success('Quantity updated');
      }
      dispatch(fetchCart()).catch(() => {});
    } catch (err) {
      console.error('remove/update failed', err);
      const msg = err?.payload || err?.message || 'Failed to update cart';
      toast.error(String(msg));
      if (String(msg).toLowerCase().includes('auth') || String(msg).toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleClearcart = async () => {
    if (!userId) {
      toast.info('You are not logged in');
      return;
    }
    try {
      const action = await dispatch(clearCartServer());
      if (action.error) throw action.error;
      toast.info('Cart cleared');
      dispatch(fetchCart()).catch(() => {});
    } catch (err) {
      console.error('clear failed', err);
      const msg = err?.payload || err?.message || 'Failed to clear cart';
      toast.error(String(msg));
    }
  };

  return (
    <>
      <Container className='mt-4'>
        {items.length === 0 ? (
          <div className='text-center'>
            <FaShoppingCart size={80} color="gray" className="mb-4" />
            <h3 className="text-muted">Your cart is empty</h3>
            <p className="text-secondary">Looks like you haven’t added anything yet.</p>
            <Button variant="danger" className="mt-3" onClick={() => navigate('/menu')}>
              Browse Menus
            </Button>
          </div>
        ) : (
          <>
            <h3 className="pb-3 text-center">Your Cart</h3>
            <Table bordered hover size="sm" className="table-sm">
              <tbody>
                {items.map((item) => {
                  const price = Number(item.price || 0);
                  const qty = getQty(item);
                  const key = getMenuId(item) || item._id || item.id || JSON.stringify(item);
                  return (
                    <tr key={key} className="align-middle">
                      <td className="text-center p-1">
                        <Image
                          src={item.image || ''}
                          alt={item.name || ''}
                          width={40}
                          height={40}
                          rounded
                          style={{ objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                        />
                      </td>
                      <td className="text-center p-1">{item.name}</td>
                      <td className="text-center p-1">₹{price}</td>
                      <td className="text-center p-1">
                        <Button size="sm" variant="outline-danger" className='m-2' onClick={() => handleRemoveOne(item)}>-</Button>
                        <span className="mx-2">{qty}</span>
                        <Button size="sm" variant="outline-success" className='m-2' onClick={() => handleAdd(item)}>+</Button>
                      </td>
                      <td className="text-center p-1">₹{price * qty}</td>
                    </tr>
                  );
                })}
                <tr className="fw-bold">
                  <td colSpan="4" className="text-center p-1">Total</td>
                  <td className="text-center p-1">₹{total}</td>
                </tr>
              </tbody>
            </Table>

            <div className="text-center my-3 mt-4">
              <Link to="/checkout" className="btn btn-danger">
                Proceed to Order
              </Link>

              <Button variant="danger" className="m-3" onClick={handleClearcart}>
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </Container>
    </>
  );
}

export default Cart;
