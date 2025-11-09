import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import { toast } from 'react-toastify';
import API from '../helpers/api';

export default function OrdersList() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/orders/my');
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('fetchOrders error', err);
      toast.error(err?.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Container className="mt-4 mb-5">
        <Card>
          <Card.Body>
            <Card.Title>My Orders</Card.Title>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-4 text-muted">
                You haven’t placed any orders yet.
              </div>
            ) : (
              <div className="table-responsive">
                <Table bordered hover className="align-middle mt-3">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Order No.</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={order._id}>
                        <td>{idx + 1}</td>
                        <td>{order.orderNumber || order._id}</td>
                        <td>{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="text-capitalize">{order.type || '-'}</td>
                        <td>{order.items?.length || 0}</td>
                        <td>₹{Number(order.totalAmount).toFixed(2)}</td>
                        <td>
                          <Badge
                            bg={
                              order.status === 'delivered'
                                ? 'success'
                                : order.status === 'cancelled'
                                ? 'danger'
                                : 'info'
                            }
                            text={order.status === 'cancelled' ? 'light' : 'dark'}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => navigate(`/orders/${order._id}`)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}
