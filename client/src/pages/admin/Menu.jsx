import { useEffect,  useRef, useState } from "react";
import { Container, Row, Col, Form, Button, Table, Alert, Badge, Image} from "react-bootstrap";
import { getCategories } from '../../helpers/category'; 
import API, { setAuthToken } from '../../helpers/api';

export default function Menus() {
const loggedUser = JSON.parse(localStorage.getItem('user'));
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isActive: true,
    isToppick: false,
  });

  const categories = getCategories();
  const [imageData, setImageData] = useState(""); 
  const [imagePreview, setImagePreview] = useState(""); 
  const fileRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState("");

  const loadMenus = async () => {
    const { data } = await API.get("/menu");
    setMenus(data);
  };

  useEffect(() => {
    loadMenus();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      price: "",
      category: "",
      isActive: true,
      isToppick: false
    });
    setEditingId(null);
    setImageData("");
    setImagePreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

   const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;       
      setImageData(dataUrl);
      setImagePreview(dataUrl);             
    };
    reader.readAsDataURL(file);
  };


  const save = async (e) => {
    e.preventDefault();
    try {
      const priceNum = form.price === "" ? undefined : Number(form.price);
      if (!form.name || priceNum == null || Number.isNaN(priceNum)) {
        alert("Name and Price are required. Price must be a number.");
        return;
      }

      const payload = {
        ...form,
        price: priceNum,
        image: imageData || undefined,
      };
      if (!payload.name || payload.price == null || Number.isNaN(payload.price)) {
        alert("Name and Price are required. Price must be a number.");
        return;
      }
      if (editingId) {
        await API.put(`/menu/${editingId}`, payload);
        setMsg("Menu updated");
      } else {
        await API.post("/menu", payload);
        setMsg("Menu created");
      }
      resetForm();
      loadMenus();
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    }
  };

  const editRow = (m) => {
    setEditingId(m._id);
    setForm({
      name: m.name || "",
      description: m.description || "",
      price: m.price ?? "",
      category: m.category || "",
      isActive: !!m.isActive,
      isToppick:!!m.isToppick,
    });
    setImagePreview(m.image || "");
    setImageData("");
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!confirm("Delete this menu item?")) return;
    try {
      await API.delete(`/menu/${id}`);
      setMsg("Menu deleted");
      loadMenus();
      setTimeout(() => setMsg(""), 1500);
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    }
  };

  const toggleActive = async (id) => {
    try {
      await API.patch(`/menu/${id}/toggle`);
      loadMenus();
    } catch (e) {
      alert(e.response?.data?.message || "Toggle failed");
    }
  };

  return (
    <>

      <Container className="py-3">
        {msg && <Alert variant="success">{msg}</Alert>}

        {/* Form */}
        <Form onSubmit={save} className="p-3 border rounded bg-light mb-4">
          <Row className="g-2">
            <Col md={3}>
              <Form.Control
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Col>
            <Col md={3}>
              <Form.Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.title} value={cat.title}>{cat.title}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Control
                placeholder="Price"
                inputMode="decimal"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, "") })
                }
                required
              />
            </Col>
           <Col md={3}>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileRef}
            />
          </Col>
            <Col md={6}>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Col>
            <Col md={3} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="isActive"
                label="Active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            </Col>
            <Col md={3} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                id="isToppick"
                label="Toppick"
                checked={form.isToppick}
                onChange={(e) => setForm({ ...form, isToppick: e.target.checked })}
              />
            </Col>
            <Col md={3} className="d-flex align-items-start">
              <Button variant="success" className="me-2" type="submit">
                {editingId ? "Update" : "Create"}
              </Button>
              {editingId && (
                <Button variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </Col>
          </Row>
        </Form>

        {/* Table */}
        <Table bordered responsive hover>
          <thead className="table-light">
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th style={{ width: 110 }}>Price</th>
              <th>Status</th>
              <th>Toppick</th>
              <th>Description</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menus.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No menu items
                </td>
              </tr>
            ) : (
              menus.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      {m.image ? (
                        <Image
                          src={m.image}
                          alt={m.name}
                          width={40}
                          height={40}
                          rounded
                          style={{ objectFit: "cover" }}
                          onError={(e) => (e.currentTarget.style.visibility = "hidden")}
                        />
                      ) : null}
                      <span className="fw-semibold">{m.name}</span>
                    </div>
                  </td>
                  <td>{m.category || <span className="text-muted">—</span>}</td>
                  <td>
                    {typeof m.price === "number"
                      ? `₹ ${m.price.toFixed(2)}`
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    {m.isActive ? (
                      <Badge bg="success">Active</Badge>
                    ) : (
                      <Badge bg="secondary">Inactive</Badge>
                    )}
                  </td>
                  <td>
                    {m.isToppick ? (
                      <Badge bg="success">Top pick</Badge>
                    ) : (
                      <Badge bg="secondary">Not Toppick</Badge>
                    )}
                  </td>
                  <td className="text-truncate" style={{ maxWidth: 280 }}>
                    {m.description || <span className="text-muted">—</span>}
                  </td>
                  <td className="d-flex gap-2">
                    <Button size="sm" variant="outline-secondary" onClick={() => toggleActive(m._id)}>
                      {m.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => editRow(m)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => remove(m._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
    </>
  );
}
