// src/pages/Checkout.jsx
import React, { useEffect, useState } from 'react';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../helpers/api';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, fetchCart } from '../redux/slices/cartSlice';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const storeUser = useSelector((s) => s.user?.user);
  const localUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const user = storeUser || localUser || null;
  const userId = user?.id || user?._id || null;

  const cartItemsFromStore = useSelector(selectCartItems) || [];
  const [cartItems, setCartItems] = useState(cartItemsFromStore || []);

  const [loadingCart, setLoadingCart] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [type, setType] = useState('dinein'); // 'dinein' | 'takeaway' | 'delivery'
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedReservation, setSelectedReservation] = useState('');
  const [markSeated, setMarkSeated] = useState(false);

  const [deliveryAddress, setDeliveryAddress] = useState({
    building: '',
    street: '',
    city: '',
    zipcode: ''
  });

  const [summary, setSummary] = useState({ subtotal: 0, tax: 0, deliveryFee: 0, total: 0 });

  useEffect(() => {
   
    if (cartItemsFromStore && cartItemsFromStore.length > 0) {
      setCartItems(cartItemsFromStore);
    } else {
      fetchCartFromStore();
    }

    fetchTables();
    if (userId) fetchMyReservations();
  }, [cartItemsFromStore, userId]);

  useEffect(() => {
    computeSummary();
  }, [cartItems, type]);

  const fetchCartFromStore = async () => {
    try {
      setLoadingCart(true);
      await dispatch(fetchCart()).unwrap();
    } catch (err) {
      console.error('fetchCart error', err);
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchTables = async () => {
    try {
      const { data } = await API.get('/table');
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchTables', err);
    }
  };

  const fetchMyReservations = async () => {
    if (!userId) return;
    try {
      const { data } = await API.get('/reservations');
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchMyReservations', err);
    }
  };

  const computeSummary = () => {
    const subtotal = (cartItems || []).reduce((s, it) => s + (Number(it.price || it.menu?.price || 0) * Number(it.qty || 0)), 0);
    const tax = +(subtotal * 0.05).toFixed(2); 
    const deliveryFee = type === 'delivery' ? 50 : 0;
    const total = +(subtotal + tax + deliveryFee).toFixed(2);
    setSummary({ subtotal, tax, deliveryFee, total });
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setDeliveryAddress((s) => ({ ...s, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.info('Please login to place an order');
      return navigate('/login');
    }

    const currentCartItems = cartItemsFromStore && cartItemsFromStore.length > 0 ? cartItemsFromStore : cartItems;
    if (!currentCartItems || currentCartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (type === 'delivery') {
      const { building, street, city, zipcode } = deliveryAddress;
      if (!building || !street || !city || !zipcode) {
        toast.error('Please provide delivery address details');
        return;
      }
    }

    const payload = {};

    if (type === 'delivery') {
      payload.deliveryAddress = deliveryAddress;
    } else if (selectedReservation) {
      payload.reservationId = selectedReservation;
      if (markSeated) payload.markSeated = true;
    } else if (selectedTable) {
      payload.tableNumber = selectedTable;
    }
 console.log('Payload', payload);
    setPlacing(true);
    try {
     
      const { data } = await API.post('/orders', payload);
      console.log(data);
      toast.success(data?.message || 'Order placed successfully');

     
      try {
        await dispatch(fetchCart()).unwrap();
      } catch (e) {
       
        console.error('fetchCart after order failed', e);
      }

      const orderId = data?.order?._id || data?.order?.id || null;
      if (orderId) {
        navigate(`/orders/${orderId}`);
      } else {
        navigate('/orders');
      }
    } catch (err) {
      console.error('place order error', err);
      const msg = err.response?.data?.message || err?.message || 'Failed to place order';
      toast.error(msg);

      if (String(msg).toLowerCase().includes('auth') || String(msg).toLowerCase().includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setPlacing(false);
    }
  };

  useEffect(() => {
    setCartItems(Array.isArray(cartItemsFromStore) ? cartItemsFromStore : cartItemsFromStore || []);
  }, [cartItemsFromStore]);

  return (
    <>
      <Container className="mt-4 mb-5">
        <Row>
          <Col md={7}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Checkout</Card.Title>

                {loadingCart ? (
                  <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : (!cartItems || cartItems.length === 0) ? (
                  <div className="text-center py-4 text-muted">
                    Your cart is empty. Add items from the menu first.
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <strong>Items</strong>
                      <div className="mt-2">
                        {cartItems.map((it, idx) => {
                          const menu = it.menu || {};
                          return (
                            <div key={idx} className="d-flex justify-content-between align-items-center border-bottom py-2">
                              <div>
                                <div><strong>{menu.name || it.name}</strong></div>
                                <div className="text-muted small">{it.qty} × ₹{it.price || menu.price}</div>
                              </div>
                              <div>₹{(Number(it.qty || 0) * Number(it.price || menu.price || 0)).toFixed(2)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Form onSubmit={handlePlaceOrder}>
                      <Form.Group className="mb-3">
                        <Form.Label>Order Type</Form.Label>
                        <Form.Select value={type} onChange={(e) => setType(e.target.value)}>
                          <option value="dinein">Dine-in</option>
                          <option value="takeaway">Takeaway</option>
                          <option value="delivery">Delivery</option>
                        </Form.Select>
                      </Form.Group>

                      {/* For dinein: either choose reservation or a table */}
                      {type !== 'delivery' && (
                        <>
                          <Form.Group className="mb-3">
                            <Form.Label>Use reservation (optional)</Form.Label>
                            <Form.Select value={selectedReservation} onChange={(e) => setSelectedReservation(e.target.value)}>
                              <option value="">Select reservation </option>
                              {reservations.map(r => (
                                <option key={r._id} value={r._id}>
                                  {new Date(r.date).toLocaleString()} — Table #{r.table?.number || (r.table?._id || '')} — {r.status}
                                </option>
                              ))}
                            </Form.Select>
                            
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Or pick a table (optional)</Form.Label>
                            <Form.Select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                              <option value="">Select table </option>
                              {tables.map(t => (
                                <option key={t._id} value={t._id}>#{t.number} — seats {t.seats}</option>
                              ))}
                            </Form.Select>
                           
                          </Form.Group>

                          {selectedReservation && (
                            <Form.Group className="mb-3">
                              <Form.Check type="checkbox" id="markSeated" label="Mark reservation as seated" checked={markSeated} onChange={(e) => setMarkSeated(e.target.checked)} />
                              
                            </Form.Group>
                          )}
                        </>
                      )}

                      {/* Delivery address */}
                      {type === 'delivery' && (
                        <>
                          <Form.Group className="mb-2">
                            <Form.Label>Building / Name</Form.Label>
                            <Form.Control name="building" value={deliveryAddress.building} onChange={handleAddressChange} required />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>Street</Form.Label>
                            <Form.Control name="street" value={deliveryAddress.street} onChange={handleAddressChange} required />
                          </Form.Group>
                          <Form.Group className="mb-2">
                            <Form.Label>City</Form.Label>
                            <Form.Control name="city" value={deliveryAddress.city} onChange={handleAddressChange} required />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Zipcode</Form.Label>
                            <Form.Control name="zipcode" value={deliveryAddress.zipcode} onChange={handleAddressChange} required />
                          </Form.Group>
                        </>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <div>
                          <Button variant="danger" type="submit" disabled={placing}>
                            {placing ? 'Placing order...' : 'Place Order'}
                          </Button>
                        </div>

                      </div>
                    </Form>
                  </>
                )}

              </Card.Body>
            </Card>
          </Col>

          <Col md={5}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <div className="mb-2">Items: {(cartItems || []).length}</div>
                <div>Subtotal: ₹{summary.subtotal.toFixed(2)}</div>
                <div>Tax (5%): ₹{summary.tax.toFixed(2)}</div>
                <div>Delivery fee: ₹{summary.deliveryFee.toFixed(2)}</div>
                <hr />
                <div className="fs-5 fw-bold">Total: ₹{summary.total.toFixed(2)}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
