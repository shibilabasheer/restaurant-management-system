import React, { useEffect, useState } from 'react';
import { Table, Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../../helpers/api';

export default function AllOrders() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 0, limit: 10, total: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    type: '',
    from: '',
    to: '',
    page: 1,
    limit: 10,
    sort: '-createdAt',
  });

  const load = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
    ).toString();

    const res = await API.get(`/orders/admin/orders?${params}`);
    const json = await res.data;
    setList(json.data || []);
    setMeta(json.meta || {});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const onFilter = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    setTimeout(load, 0);
  };

  const goPage = (p) => {
    setFilters(f => ({ ...f, page: p }));
    setTimeout(load, 0);
  };

  return (
    <div className="p-3">
      <Form onSubmit={onFilter} className="mb-3">
        <Row className="g-2">
          <Col md="3"><Form.Control placeholder="Search name/email" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/></Col>
          <Col md="2">
            <Form.Select value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
              <option value="">All Status</option>
              {['received','preparing','ready','out-for-delivery','delivered','cancelled','refunded'].map(s=>(
                <option key={s} value={s}>{s}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md="2">
            <Form.Select value={filters.type} onChange={e=>setFilters({...filters,type:e.target.value})}>
              <option value="">All Types</option>
              {['dinein','delivery','pickup'].map(t=>(
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md="2"><Form.Control type="date" value={filters.from} onChange={e=>setFilters({...filters,from:e.target.value})}/></Col>
          <Col md="2"><Form.Control type="date" value={filters.to} onChange={e=>setFilters({...filters,to:e.target.value})}/></Col>
          <Col md="1"><Button type="submit" disabled={loading}>{loading ? <Spinner size="sm"/> : 'Filter'}</Button></Col>
        </Row>
      </Form>

      <Table bordered hover responsive size="sm">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order #</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Status</th>
            <th className="text-end">Total</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {list.map(o=>(
            <tr key={o._id}>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
              <td>{o.orderNumber || o._id}</td>
              <td>{o.customer ? `${o.customer.name} (${o.customer.email})` : '-'}</td>
              <td>{o.type}</td>
              <td className="text-capitalize">{o.status}</td>
              <td className="text-end">₹{Number(o.totalAmount || 0).toLocaleString()}</td>
              <td><Button size="sm" variant="outline-primary" onClick={() => navigate(`/orderdetails/${o._id}`)}>
                  View
                  </Button>
              </td>
            </tr>
          ))}
          {list.length === 0 && !loading && (
            <tr><td colSpan={6} className="text-center text-muted">No orders</td></tr>
          )}
        </tbody>
      </Table>

      <div className="d-flex justify-content-between">
        <div>Showing page {meta.page} of {meta.pages} — {meta.total} orders</div>
        <div className="d-flex gap-2">
          <Button size="sm" disabled={meta.page<=1} onClick={()=>goPage(meta.page-1)}>Prev</Button>
          <Button size="sm" disabled={meta.page>=meta.pages} onClick={()=>goPage(meta.page+1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
