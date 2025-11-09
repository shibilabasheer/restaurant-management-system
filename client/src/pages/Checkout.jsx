import React, { useEffect, useState } from 'react';
import {
  Container, Card, Row, Col, Form, Button, Spinner
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import API from '../helpers/api';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartItems, fetchCart } from '../redux/slices/cartSlice';
import { loadRazorpay } from '../helpers/loadRazorpay';

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

  const [type, setType] = useState('dinein');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 💳 new field
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
    if (cartItemsFromStore?.length > 0) setCartItems(cartItemsFromStore);
    else fetchCartFromStore();

    fetchTables();
    if (userId) fetchMyReservations();
  }, [cartItemsFromStore, userId]);

  useEffect(() => computeSummary(), [cartItems, type]);

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
    const subtotal = (cartItems || []).reduce(
      (s, it) => s + (Number(it.price || it.menu?.price || 0) * Number(it.qty || 0)), 0
    );
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

    const items = cartItemsFromStore?.length > 0 ? cartItemsFromStore : cartItems;
    if (!items?.length) return toast.error('Your cart is empty');

    if (type === 'delivery') {
      const { building, street, city, zipcode } = deliveryAddress;
      if (!building || !street || !city || !zipcode) {
        return toast.error('Please fill delivery address');
      }
    }

    const payload = { type };
    if (type === 'delivery') payload.deliveryAddress = deliveryAddress;
    else if (selectedReservation) {
      payload.reservationId = selectedReservation;
      if (markSeated) payload.markSeated = true;
    } else if (selectedTable) {
      payload.tableNumber = selectedTable;
    }

    setPlacing(true);

    if (paymentMethod === 'cod') {
      try {
        const { data } = await API.post('/orders', payload);
        toast.success('Order placed (Cash on Delivery)');
        const orderId = data?.order?._id || data?.order?.id;
        await dispatch(fetchCart()).unwrap();
        navigate(orderId ? `/orders/${orderId}` : '/orders');
      } catch (err) {
        console.error('place order error', err);
        toast.error(err.response?.data?.message || 'Order failed');
      } finally {
        setPlacing(false);
      }
      return;
    }

    // Razorpay flow
    try {
      await loadRazorpay();
      const { data } = await API.post('/payments/razorpay/create', payload);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'Restaurant Order',
        description: 'Payment for your order',
        order_id: data.razorpayOrderId,
        handler: async function (response) {
         console.log("Razorpay Payment success:", response);  // 👈 add this
  try {
    const verifyPayload = {
      razorpayPaymentId: response.razorpay_payment_id,
      razorpayOrderId: response.razorpay_order_id,
      razorpaySignature: response.razorpay_signature,
      payload,
    };

    const verify = await API.post('/payments/razorpay/verify', verifyPayload);
    console.log("Verify response:", verify.data); 

    if (verify.data?.success && verify.data.order) {
      toast.success('Payment successful! Order placed.');
      const orderId = verify.data.order._id || verify.data.order.id;
      await dispatch(fetchCart()).unwrap();
      navigate(`/payment-success/${orderId}`);
    } else {
      toast.error('Payment failed');
      navigate('/orders');
    }
  } catch (e) {
    console.error('verify error', e);
    toast.error('Payment verification failed');
    navigate('/orders');
  }
        },
        theme: { color: '#dc3545' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Payment error', err);
      toast.error('Payment initiation failed');
    } finally {
      setPlacing(false);
    }
  };

  useEffect(() => {
    setCartItems(Array.isArray(cartItemsFromStore) ? cartItemsFromStore : cartItemsFromStore || []);
  }, [cartItemsFromStore]);

  return (
    <Container className="mt-4 mb-5">
      <Row>
        <Col md={7}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Checkout</Card.Title>

              {loadingCart ? (
                <div className="text-center py-4"><Spinner animation="border" /></div>
              ) : (!cartItems?.length) ? (
                <div className="text-center py-4 text-muted">Your cart is empty</div>
              ) : (
                <>
                  <div className="mb-3">
                    <strong>Items</strong>
                    {cartItems.map((it, i) => {
                      const menu = it.menu || {};
                      return (
                        <div key={i} className="d-flex justify-content-between border-bottom py-2">
                          <div>
                            <div><strong>{menu.name || it.name}</strong></div>
                            <div className="text-muted small">{it.qty} × ₹{it.price || menu.price}</div>
                          </div>
                          <div>₹{(Number(it.qty) * Number(it.price || menu.price)).toFixed(2)}</div>
                        </div>
                      );
                    })}
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

                    {type !== 'delivery' && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>Use reservation (optional)</Form.Label>
                          <Form.Select value={selectedReservation} onChange={(e) => setSelectedReservation(e.target.value)}>
                            <option value="">Select reservation</option>
                            {reservations.map(r => (
                              <option key={r._id} value={r._id}>
                                {new Date(r.date).toLocaleString()} — Table #{r.table?.number}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>Or pick a table</Form.Label>
                          <Form.Select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)}>
                            <option value="">Select table</option>
                            {tables.map(t => (
                              <option key={t._id} value={t._id}>#{t.number} — {t.seats} seats</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </>
                    )}

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

                    {/* Payment Method */}
                    <Form.Group className="mb-3">
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                        <option value="cod">Cash on Delivery</option>
                        <option value="razorpay">Pay Online (Razorpay)</option>
                      </Form.Select>
                    </Form.Group>

                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <Button variant="danger" type="submit" disabled={placing}>
                        {placing ? 'Processing...' : 'Place Order'}
                      </Button>
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
              <div>Items: {(cartItems || []).length}</div>
              <div>Subtotal: ₹{summary.subtotal.toFixed(2)}</div>
              <div>Tax: ₹{summary.tax.toFixed(2)}</div>
              <div>Delivery Fee: ₹{summary.deliveryFee.toFixed(2)}</div>
              <hr />
              <div className="fs-5 fw-bold">Total: ₹{summary.total.toFixed(2)}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
