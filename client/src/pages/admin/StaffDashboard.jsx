import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import API from '../../helpers/api';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ordersCount, setOrdersCount] = useState(null);
  const [reservationsCount, setReservationsCount] = useState(null);
  const [latestOrders, setLatestOrders] = useState([]);
  const [latestReservations, setLatestReservations] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError('');

        const { data } = await API.get('/auth/staff/dashboard');

        if (cancelled) return;

        setOrdersCount(typeof data.ordersCount === 'number' ? data.ordersCount : null);
        setReservationsCount(typeof data.reservationsCount === 'number' ? data.reservationsCount : null);
        setLatestOrders(Array.isArray(data.latestOrders) ? data.latestOrders : []);
        setLatestReservations(Array.isArray(data.latestReservations) ? data.latestReservations : []);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) return (
    <Container className="py-4 text-center"><Spinner animation="border" /></Container>
  );

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Orders</Card.Title>
              <h2 className="mb-0">{ordersCount !== null ? ordersCount : '—'}</h2>
              <Card.Text className="text-muted mt-2">Total orders</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Reservations</Card.Title>
              <h2 className="mb-0">{reservationsCount !== null ? reservationsCount : '—'}</h2>
              <Card.Text className="text-muted mt-2">Total reservations</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Recent Open Orders</Card.Title>
              <h2 className="mb-0">{latestOrders.filter(o => o.status === 'received' || o.status === 'preparing' || o.status === 'ready').length}</h2>
              <Card.Text className="text-muted mt-2">Open in latest 5</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Upcoming Reservations</Card.Title>
              <h2 className="mb-0">{latestReservations.filter(r => new Date(r.date) > new Date()).length}</h2>
              <Card.Text className="text-muted mt-2">Upcoming in latest 5</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Latest 5 Orders</strong>
              <Button size="sm" variant="outline-primary" onClick={() => navigate('/allorders')}>View all</Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {latestOrders.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-3">No orders</td></tr>
                  )}
                  {latestOrders.map((o, i) => (
                    <tr key={o._id || o.id || i}>
                      <td>{i + 1}</td>
                      <td>{o.orderNumber || o._id || o.id}</td>
                      <td>{o.customer?.name || o.customerName || o.customer_email || '-'}</td>
                      <td>{typeof o.totalAmount === 'number' ? `₹${o.totalAmount.toFixed(2)}` : (o.total ? `₹${o.total}` : '-')}</td>
                      <td>{o.status}</td>
                      <td>{new Date(o.createdAt || o.created_at || o.date).toLocaleString()}</td>
                      <td><Button size="sm" onClick={() => navigate(`/orders/${o._id || o.id}`)}>View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <strong>Latest 5 Reservations</strong>
              <Button size="sm" variant="outline-primary" onClick={() => navigate('/reservations')}>View all</Button>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Res #</th>
                    <th>Name</th>
                    <th>Table</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {latestReservations.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-3">No reservations</td></tr>
                  )}
                  {latestReservations.map((r, i) => (
                    <tr key={r._id || r.id || i}>
                      <td>{i + 1}</td>
                      <td>{r._id || r.id}</td>
                      <td>{r.name || r.customer?.name || '-'}</td>
                      <td>{r.table?.number || r.tableNumber || '-'}</td>
                      <td>{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
                      <td>{r.status}</td>
                      <td><Button size="sm" onClick={() => navigate(`/reservations/${r._id || r.id}`)}>View</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
