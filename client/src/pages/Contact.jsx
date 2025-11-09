import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <Container className="py-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4 text-center">Contact Us</h2>

      {submitted && (
        <Alert variant="success">
          Thank you for reaching out! We'll get back to you soon.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Your Name</Form.Label>
          <Form.Control
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formMessage">
          <Form.Label>Message</Form.Label>
          <Form.Control
            as="textarea"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Your message"
            required
          />
        </Form.Group>

        <Button variant="danger" type="submit">
          Send Message
        </Button>
      </Form>
    </Container>
  );
};

export default Contact;
