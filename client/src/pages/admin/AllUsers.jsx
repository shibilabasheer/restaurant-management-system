import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Image} from "react-bootstrap";
import { FaUsers } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../../helpers/api';

function AllUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loggedUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await API.get('auth/listUsers'); 
        if (mounted) setUsers(data);
      } catch (e) {
        console.error(e?.response?.data || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <div className="text-muted">Loading users…</div>
      </Container>
    );
  }

  return (
    <Container className='mt-4'>
      {users.length === 0 ? (
        <div className='text-center'>
          <FaUsers size={80} color="gray" className="mb-4" />
          <h3 className="text-muted">No Users Found</h3>
          <p className="text-secondary">No users are registered yet!</p>
        </div>
      ) : (
        <>
         
          <Table bordered responsive hover>
            <thead className="table-light">
              <tr>
                <th className="text-center p-1">Name</th>
                <th className='text-center p-1'>Email</th>
                <th className='text-center p-1'>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="text-center p-1">{u.name}</td>
                  <td className="text-center p-1">{u.email}</td>
                  <td className="text-center p-1">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
    </Container>
  );
}

export default AllUsers;
