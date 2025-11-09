import React, { useEffect, useState } from 'react';
import { Container, Button, Modal, Form, Row, Col, Spinner } from 'react-bootstrap';
import BSTable from 'react-bootstrap/Table';
import API, { setAuthToken } from '../../helpers/api';

export default function App() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ number: '', seats: 4, isAvailable: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchTables(); }, []);

  async function fetchTables() {
    try {
      setLoading(true);
      const { data } = await API.get('/table'); 
      setTables(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load tables');
    } finally {
      setLoading(false);
    }
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (name === 'seats' ? Number(value) : value) }));
  }

  async function createTable(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await API.post('/table',form); 
      setTables(prev => [...prev, data].sort((a,b) => (a.number > b.number ? 1 : -1)));
      setShowCreate(false);
      setForm({ number: '', seats: 4, isAvailable: true });
    } catch (err) {
      console.error(err);
      setError('Unable to create table');
    } finally {
      setSaving(false);
    }
  }

  function openEdit(table) {
    setEditingId(table._id);
    setForm({ number: table.number, seats: table.seats, isAvailable: table.isAvailable });
    setShowEdit(true);
  }

  async function saveEdit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await API.put(`/table/${editingId}`, form);
      setTables(prev => prev.map(t => (t._id === data._id ? data : t)));
      setShowEdit(false);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      setError('Unable to update table');
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(id) {
    try {
      const { data } = await API.patch(`/table/${id}/availability`);
      setTables(prev => prev.map(t => (t._id === data._id ? data : t)));
    } catch (err) {
      console.error(err);
      setError('Failed to toggle availability');
    }
  }

  async function deleteTable(id) {
    if (!window.confirm('Delete this table?')) return;
    try {
      await API.delete(`/table/${id}`);
      setTables(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete table');
    }
  }

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col className="text-end">
          <Button onClick={() => setShowCreate(true)}>+ Create Table</Button>
        </Col>
      </Row>

      {error && <div className="mb-3 text-danger">{error}</div>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <BSTable striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Number</th>
              <th>Seats</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 && (
              <tr><td colSpan={5} className="text-center">No tables yet</td></tr>
            )}
            {tables.map((t, i) => (
              <tr key={t._id}>
                <td>{i + 1}</td>
                <td>{t.number}</td>
                <td>{t.seats}</td>
                <td>{t.isAvailable ? 'Yes' : 'No'}</td>
                <td>
                  <Button size="sm" onClick={() => toggleAvailability(t._id)} className="me-2">{t.isAvailable ? 'Mark Busy' : 'Mark Available'}</Button>
                  <Button size="sm" variant="outline-primary" onClick={() => openEdit(t)} className="me-2">Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteTable(t._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </BSTable>
      )}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Form onSubmit={createTable}>
          <Modal.Header closeButton>
            <Modal.Title>Create Table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Number</Form.Label>
              <Form.Control name="number" required value={form.number} onChange={onChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Seats</Form.Label>
              <Form.Control name="seats" type="number" min={1} value={form.seats} onChange={onChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check type="checkbox" name="isAvailable" label="Available" checked={form.isAvailable} onChange={onChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Form onSubmit={saveEdit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Table</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Number</Form.Label>
              <Form.Control name="number" required value={form.number} onChange={onChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Seats</Form.Label>
              <Form.Control name="seats" type="number" min={1} value={form.seats} onChange={onChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check type="checkbox" name="isAvailable" label="Available" checked={form.isAvailable} onChange={onChange} />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
}
