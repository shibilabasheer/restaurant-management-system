import React, { useEffect, useState } from 'react';
import { Table, Container, Button, Spinner, Badge, Row, Col, Alert } from 'react-bootstrap';
import API from '../../helpers/api';

function fmtDate(d) {
    const dt = new Date(d);
    return dt.toLocaleString(); 
    return d;
}

export default function ReservationsList() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); 
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setError('');
      setLoading(true);
      const { data } = await API.get('/reservations/all'); 
      setReservations(data || []);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load reservations');
    } finally {
      setLoading(false);
    }
  }

  async function changeStatus(id, status) {
    //alert(id);
    if (!window.confirm(`Set reservation to "${status}"?`)) return;
    try {
      setActionLoading(id);
      const { data } = await API.patch(`/reservations/${id}/status`, { status });
      setReservations(prev => prev.map(r => (r._id === data._id ? data : r)));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Status update failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      setActionLoading(id);
      await API.delete(`/reservations/${id}`);
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || 'Delete failed');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <Container className="py-3">
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Date & Time</th>
              <th>Table</th>
              <th>Party</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Status</th>
              <th style={{ width: 220 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center text-muted">No reservations</td>
              </tr>
            ) : reservations.map((r, i) => (
              <tr key={r._id}>
                <td>{i + 1}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(r.date)}</td>
                <td>{r.table?.number ?? <span className="text-muted">—</span>}</td>
                <td>{r.partySize}</td>
                <td>{r.name || r.customer?.name || <span className="text-muted">—</span>}</td>
                <td>{r.phone || r.customer?.phone || <span className="text-muted">—</span>}</td>
                <td>
                  <Badge bg={
                    r.status === 'pending' ? 'warning' :
                    r.status === 'confirmed' ? 'success' :
                    r.status === 'seated' ? 'primary' :
                    r.status === 'cancelled' ? 'danger' : 'info'
                  }>{r.status}</Badge>
                </td>
                <td className="d-flex align-items-center justify-content-center gap-1 p-1 m-0">
                  <Button size="sm" variant="success" disabled={actionLoading === r._id} onClick={() => changeStatus(r._id, 'confirmed')}>
                    {actionLoading === r._id ? <Spinner as="span" animation="border" size="sm" /> : 'Confirm'}
                  </Button>
                  <Button size="sm" variant="primary" disabled={actionLoading === r._id} onClick={() => changeStatus(r._id, 'seated')}>
                    Seated
                  </Button>
                  <Button size="sm" variant="danger" disabled={actionLoading === r._id} onClick={() => changeStatus(r._id, 'cancelled')}>
                    Cancel
                  </Button>
                  <Button size="sm" variant="outline-danger" disabled={actionLoading === r._id} onClick={() => remove(r._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
