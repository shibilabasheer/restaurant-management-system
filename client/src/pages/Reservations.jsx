// src/pages/ReservationsCustomer.jsx
import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import { FaConciergeBell } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../helpers/api";

export default function ReservationsCustomer() {
  const navigate = useNavigate();
  const storeUser = useSelector((s) => s.user?.user);
  const localUser = (() => { try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; } })();
  const user = storeUser || localUser || null;
  const userId = user?.id || user?._id || null;

  const [tables, setTables] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    date: "",
    partySize: 1,
    table: "",
    name: "",
    phone: ""
  });

  useEffect(() => {
    fetchTables();
    if (userId) fetchMyReservations();
  }, [userId]);

  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const { data } = await API.get("/table");
      setTables(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load tables");
    } finally {
      setLoadingTables(false);
    }
  };

  const fetchMyReservations = async () => {
    if (!userId) return;
    try {
      setLoadingReservations(true);
      const { data } = await API.get("/reservations"); 
      setMyReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMyReservations([]);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(s => ({ ...s, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!userId) {
      toast.info("Please login to make a reservation");
      navigate("/login");
      return;
    }

    if (!form.date || !form.partySize || !form.table) {
      toast.error("Date, party size and table are required");
      return;
    }

    try {
      setCreating(true);
      const payload = {
        date: form.date,
        partySize: Number(form.partySize),
        table: form.table,
        name: form.name || undefined,
        phone: form.phone || undefined
      };
      const { data } = await API.post("/reservations", payload);
      toast.success("Reservation created");
      setForm({ date: "", partySize: 1, table: "", name: "", phone: "" });
      fetchMyReservations();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Failed to create reservation";
      toast.error(msg);
   
      if (String(msg).toLowerCase().includes("auth") || String(msg).toLowerCase().includes("token")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    try {
      await API.delete(`/reservations/${id}`);
      toast.success("Reservation cancelled");
      setMyReservations(prev => prev.filter(r => (r._id || r.id) !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel reservation");
    }
  };

  return (
    <>
     
      <Container className="mt-3 mb-5">
        <h3 className="pb-3 text-center">Reserve a Table</h3>

        <Row xs={1} md={2} className="g-4">
          {/* Create form */}
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>Create Reservation</Card.Title>
                <Form onSubmit={handleCreate}>
                  <Form.Group className="mb-2">
                    <Form.Label>Date & Time</Form.Label>
                    <Form.Control type="datetime-local" name="date" value={form.date} onChange={handleChange} required />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Party Size</Form.Label>
                    <Form.Control type="number" name="partySize" min="1" value={form.partySize} onChange={handleChange} required />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Table</Form.Label>
                    <Form.Select name="table" value={form.table} onChange={handleChange} required>
                      <option value="">Select a table</option>
                      {loadingTables ? <option>Loading...</option> : tables.map(t => (
                        <option key={t._id || t.id} value={t._id || t.id}>#{t.number} — seats {t.seats}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Name (optional)</Form.Label>
                    <Form.Control name="name" value={form.name} onChange={handleChange} />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Phone (optional)</Form.Label>
                    <Form.Control name="phone" value={form.phone} onChange={handleChange} />
                  </Form.Group>

                  <Button variant="danger" type="submit" disabled={creating}>
                    {creating ? "Creating..." : "Reserve Table"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* My reservations */}
          <Col>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title>My Reservations</Card.Title>

                {loadingReservations ? (
                  <div className="text-center py-4"><Spinner animation="border" /></div>
                ) : myReservations.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <FaConciergeBell size={48} className="mb-2" />
                    <div>No reservations yet</div>
                  </div>
                ) : (
                  myReservations.map(r => (
                    <div key={r._id || r.id} className="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                      <div>
                        <div><strong>{new Date(r.date).toLocaleString()}</strong> — {r.partySize} people</div>
                        <div className="text-muted small">Table #{r.table?.number || (r.table?._id || r.table)} • {r.status}</div>
                      </div>
                      {(r.status !== "cancelled" && r.status !== "completed") && (
                        <Button size="sm" variant="outline-danger" onClick={() => handleCancel(r._id || r.id)}>Cancel</Button>
                      )}
                    </div>
                  ))
                )}

              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
