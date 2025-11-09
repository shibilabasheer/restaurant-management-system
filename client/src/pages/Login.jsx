import  { useState } from 'react'
import { useDispatch } from 'react-redux';
import { Row, Col, Form, Button, Container } from 'react-bootstrap'
import { useNavigate , NavLink} from 'react-router-dom';
import API, { setAuthToken } from '../helpers/api';
import { loginAction } from '../redux/slices/userSlice';
import { toast } from "react-toastify";

function Login() {

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', {
          email: form.email,
          password: form.password,
      });
      const { token, user } = data;
      setAuthToken(token);
      dispatch(loginAction({ token, ...user }));
      toast.success("Login Successful"); 
      if (user.role === 'admin') navigate('/menus');
      else if (user.role === 'staff') navigate('/allorders');
      else navigate('/');
    } catch (err) {
        const message = err?.response?.data?.message || 'Login failed';
        toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (

    <Container fluid className="vh-100">
      <Row className="h-100">

        <Col md={6} className="d-flex align-items-center justify-content-center">
          <div className="w-75">

            <img src="/logo.png" style={{ width: '100px', marginBottom: '20px' }} className="d-block mx-auto" alt="logo" />

            <h2 className="mb-4 text-center fw-semibold" style={{ color: '#2e3a34e3' }}>Login</h2>

            <Form onSubmit={handleSubmit} action="">
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Label>Email address</Form.Label>
                <Form.Control type="email" placeholder="Enter your email" required onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Form.Group>

              <Form.Group controlId="formPassword" className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" placeholder="Enter your password" required onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </Form.Group>

              <Button variant="success" type="submit" className="w-100 mb-2">
                Login
              </Button>
            </Form>
            <NavLink to="/register" className="mt-5">New member ? Register here</NavLink>
          </div>
        </Col>

        <Col md={6} className="p-0 d-none d-md-block">
          <img src="/login.jpg" alt="Login image" className="w-100 h-100 object-fit-cover" style={{ objectFit: 'cover' }} />
        </Col>

      </Row>
    </Container>
  )
}

export default Login