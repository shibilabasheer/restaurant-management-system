import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Modal, Form, Spinner, Alert, Table } from 'react-bootstrap';
import API from '../../helpers/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', phone: '', role: 'staff' });

  // Edit 
  const [showEdit, setShowEdit] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const allowedRoles = ['customer', 'admin', 'staff'];

  useEffect(() => { fetchStaffs(); }, []);

  async function fetchStaffs() {
    try {
      setLoading(true);
      setError('');
      const { data } = await API.get('/auth/staffs');
      setUsers(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  function onCreateChange(e) {
    const { name, value } = e.target;
    setCreateForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setCreating(true);
      setError('');
      const payload = { ...createForm };
      const { data } = await API.post('/auth/users', payload);
      setUsers(prev => [...prev, { _id: data.id, name: createForm.name, email: data.email, role: data.role }]);
      setShowCreate(false);
      setCreateForm({ name: '', email: '', password: '', phone: '', role: 'staff' });
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to create user');
    } finally {
      setCreating(false);
    }
  }

  function openEdit(user) {
    setEditUser(user);
    setShowEdit(true);
  }

  function onEditChange(e) {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  }

  async function saveRole(e) {
    e.preventDefault();
    if (!editUser) return;
    if (!allowedRoles.includes(editUser.role)) return setError('Invalid role');
    try {
      setEditLoading(true);
      setError('');
      const { data } = await API.patch(`/auth/users/${editUser._id}/role`, { role: editUser.role }); 
      setUsers(prev => prev.map(u => (u._id === data.id ? { ...u, role: data.role } : u)));
      setShowEdit(false);
      setEditUser(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Unable to update role');
    } finally {
      setEditLoading(false);
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/auth/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete user');
    }
  }

  return (
    <Container className="py-4">
      <Row className="mb-3 align-items-center">
        <Col>
          <h4 className="m-0">Staff & Users</h4>
        </Col>
        <Col className="text-end">
          <Button onClick={() => setShowCreate(true)}>+ Create User</Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={6} className="text-center">No users found</td></tr>
            )}
            {users.map((u, i) => (
              <tr key={u._id}>
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>{u.role}</td>
                <td>
                  <Button size="sm" onClick={() => openEdit(u)} className="me-2">Change Role</Button>
                  <Button size="sm" variant="danger" onClick={() => deleteUser(u._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Create Modal */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)}>
        <Form onSubmit={handleCreate}>
          <Modal.Header closeButton>
            <Modal.Title>Create User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control name="name" required value={createForm.name} onChange={onCreateChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" required value={createForm.email} onChange={onCreateChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control name="password" type="password" required value={createForm.password} onChange={onCreateChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control name="phone" value={createForm.phone} onChange={onCreateChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Role</Form.Label>
              <Form.Select name="role" value={createForm.role} onChange={onCreateChange}>
                {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Role Modal */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Form onSubmit={saveRole}>
          <Modal.Header closeButton>
            <Modal.Title>Change Role</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editUser && (
              <>
                <p><strong>{editUser.name}</strong> — {editUser.email}</p>
                <Form.Group className="mb-2">
                  <Form.Label>Role</Form.Label>
                  <Form.Select name="role" value={editUser.role} onChange={onEditChange}>
                    {allowedRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button type="submit" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
