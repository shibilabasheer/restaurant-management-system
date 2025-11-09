import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import {useNavigate} from 'react-router-dom';

function ProfilePage() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  console.log(user)

  const handleLogout = () => {

    dispatch(logout())
    navigate('/');
  }

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center shadow rounded-4">
            <Card.Body>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="User"
                  className="rounded-circle mb-3"
                  style={{ width: '100px', height: '100px' }}
                />
              ) : (
                <FaUserCircle size={100} className="text-secondary mb-3" />
              )}
              <h4 className="mb-1">{user.name}</h4>
              <p className="text-muted mb-1">{user.email}</p>

              <div className="mt-4 d-flex justify-content-center gap-3">

                <Button variant="outline-success" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ProfilePage;
