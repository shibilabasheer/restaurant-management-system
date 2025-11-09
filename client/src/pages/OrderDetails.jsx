import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import API from '../helpers/api';
import { useSelector } from 'react-redux';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const storeUser = useSelector((s) => s.user?.user);
  const localUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const user = storeUser || localUser || null;
  const isStaff = user && ['admin', 'staff'].includes(user.role);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchOrder(); 
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
      setSelectedStatus(data.status || '');
    } catch (err) {
      console.error('fetchOrder error', err);
      toast.error(err?.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedStatus) return;
    setStatusUpdating(true);
    try {
      const { data } = await API.patch(`/orders/${id}/status`, { status: selectedStatus });
      setOrder(data);
      toast.success('Status updated');
    } catch (err) {
      console.error('update status error', err);
      toast.error(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const statusOptions = ['received','preparing','ready','out-for-delivery','delivered','cancelled','refunded'];

  if (loading) {
    return (
      <>
        <Container className="text-center py-5">
          <Spinner animation="border" />
        </Container>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Container className="py-5 text-center">
          <h5>Order not found</h5>
          <Button variant="secondary" onClick={() => navigate('/orders')}>Back to orders</Button>
        </Container>
      </>
    );
  }

  const {
    orderNumber,
    createdAt,
    customer,
    items = [],
    table,
    deliveryAddress,
    subtotal = 0,
    tax = 0,
    deliveryFee = 0,
    totalAmount,
    status,
    type
  } = order;

  return (
    <>
      <Container className="mt-4 mb-5">
        <Row>
          <Col lg={8}>
            <Card className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">Order {orderNumber || `#${id}`}</h5>
                    <div className="text-muted small">
                      {createdAt ? new Date(createdAt).toLocaleString() : ''}
                      {type ? ` • ${type}` : ''}
                    </div>
                    <div className="mt-2">
                      <strong>Customer:</strong> {customer?.name || '—'} {customer?.email ? ` • ${customer.email}` : ''}
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="mb-2"><strong className="me-2">Status:</strong> <span className="badge bg-info text-dark">{status}</span></div>

                    {isStaff && (
                      <div className="d-flex align-items-center mt-2">
                        <Form.Select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} size="sm" className="me-2">
                          <option value="">Change status</option>
                          {statusOptions.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </Form.Select>
                        <Button size="sm" variant="primary" onClick={handleUpdateStatus} disabled={!selectedStatus || statusUpdating}>
                          {statusUpdating ? 'Updating...' : 'Update'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <h6>Items</h6>
                <Table responsive bordered className="mt-2 mb-0">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const menu = it.menu || {};
                      const name = menu.name || it.name || 'Item';
                      const price = Number(it.price || menu.price || 0);
                      const qty = Number(it.qty || 0);
                      return (
                        <tr key={idx}>
                          <td>
                            <div><strong>{name}</strong></div>
                            {menu.image && <div className="text-muted small">{/* optionally show image */}</div>}
                          </td>
                          <td className="text-center">{qty}</td>
                          <td className="text-end">₹{price.toFixed(2)}</td>
                          <td className="text-end">₹{(price * qty).toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <h6>Notes & Info</h6>
                <div className="mb-2">
                  <strong>Table:</strong> {table ? (table.number ? `#${table.number} (seats ${table.seats})` : table._id) : '—'}
                </div>
                <div className="mb-2">
                  <strong>Delivery Address:</strong>
                  {deliveryAddress ? (
                    <div className="ms-2">
                      {deliveryAddress.building && <div>{deliveryAddress.building}</div>}
                      {deliveryAddress.street && <div>{deliveryAddress.street}</div>}
                      {deliveryAddress.city && <div>{deliveryAddress.city} {deliveryAddress.zipcode ? `- ${deliveryAddress.zipcode}` : ''}</div>}
                    </div>
                  ) : ' — '}
                </div>
              </Card.Body>
            </Card>

          </Col>

          <Col lg={4}>
            <Card className="mb-3">
              <Card.Body>
                <h6>Payment Summary</h6>
                <div className="d-flex justify-content-between"><div>Subtotal</div><div>₹{Number(subtotal).toFixed(2)}</div></div>
                <div className="d-flex justify-content-between"><div>Tax</div><div>₹{Number(tax).toFixed(2)}</div></div>
                <div className="d-flex justify-content-between"><div>Delivery fee</div><div>₹{Number(deliveryFee).toFixed(2)}</div></div>
                <hr />
                <div className="d-flex justify-content-between fw-bold"><div>Total</div><div>₹{Number(totalAmount).toFixed(2)}</div></div>
                <div className="mt-3">
                   <Button
    variant="secondary"
    onClick={() =>
      user && ['admin', 'staff'].includes(user.role)
        ? navigate('/allorders')
        : navigate('/orders')
        }
    >
    Back to orders
  </Button>
                  
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </>
  );
}
