import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../helpers/api';
import { Container, Card, Spinner, Button } from 'react-bootstrap';

export default function PaymentSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (e) {
        console.error('fetch order', e);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) return <Container className="p-4 text-center"><Spinner animation="border" /></Container>;

  if (!order) return (
    <Container className="p-4">
      <Card>
        <Card.Body>
          <h4>Order not found</h4>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </Card.Body>
      </Card>
    </Container>
  );

  return (
    <Container className="p-4">
      <Card>
        <Card.Body>
          <h3 className="mb-3">Payment Successful 🎉</h3>
          <div><strong>Order:</strong> {order.orderNumber || order._id}</div>
          <div><strong>Status:</strong> {order.status}</div>
          <div><strong>Total:</strong> ₹{Number(order.totalAmount || 0).toFixed(2)}</div>
          {order.payment && (
            <>
              <div><strong>Payment Provider:</strong> {order.payment.provider}</div>
              <div><strong>Transaction ID:</strong> {order.payment.transactionId}</div>
              <div><strong>Payment status:</strong> {order.payment.status}</div>
            </>
          )}
          <hr />
          <h5>Items</h5>
          <ul>
            {order.items.map((it, i) => (
              <li key={i}>{it.qty} × {it.menu?.name || 'Item'} — ₹{(it.price || 0).toFixed(2)}</li>
            ))}
          </ul>
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate(`/orders/${order._id}`)}>View order</Button>{' '}
            <Button variant="secondary" onClick={() => navigate('/')}>Back to home</Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
