import React, { useEffect, useState } from "react";
import API from '../../helpers/api';
import { Container, Row, Col, Card,Badge } from "react-bootstrap";
import { BarChart, Bar, PieChart, Pie, Tooltip, Legend, XAxis, YAxis, CartesianGrid } from "recharts";

export default function DashboardAnalytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/analytics/dashboard")
      .then(res => setData(res.data))
      .catch(err => console.error("Analytics error", err));
  }, []);

  if (!data) return <div className="text-center mt-4">Loading analytics...</div>;

  return (
    <Container className="my-4">
      <Row>
        <Col md={6}>
          <Card className="p-3">
            <h5>Revenue by Service Type</h5>
            <PieChart width={300} height={250}>
              <Pie dataKey="totalRevenue" data={data.revenueByType} nameKey="_id" fill="#8884d8" label />
              <Tooltip />
              <Legend />
            </PieChart>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="p-3">
            <h5>Monthly Revenue Trend</h5>
            <BarChart width={400} height={250} data={data.monthlyRevenue}>
              <XAxis dataKey="_id" tickFormatter={(m) => ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m-1]} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col md={6}>
          <Card className="p-3">
            <h5>Reservation Trends (Monthly)</h5>
            <BarChart width={400} height={250} data={data.reservationTrends}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalReservations" fill="#ffc658" />
            </BarChart>
          </Card>
        </Col>
        <Col md={6}>
  <Card className="p-3 shadow-sm border-0">
    <Card.Body>
      <h5 className="fw-bold mb-3">
       Top 5 Popular Dishes
      </h5>

      {data.popularDishes && data.popularDishes.length > 0 ? (
        <ul className="list-unstyled mb-0">
          {data.popularDishes.map((dish, idx) => (
            <li
              key={idx}
              className="d-flex align-items-center justify-content-between p-2 mb-2 rounded hover-bg"
              style={{
                backgroundColor: idx % 2 === 0 ? "#f8f9fa" : "#fff",
                transition: "background-color 0.3s ease",
              }}
            >
              <div className="d-flex align-items-center">
              
                {dish.image ? (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "8px",
                      objectFit: "cover",
                      marginRight: "10px",
                      border: "1px solid #dee2e6",
                    }}
                  />
                ) : (
                  <div
                    className="d-flex align-items-center justify-content-center bg-secondary text-white rounded"
                    style={{
                      width: 48,
                      height: 48,
                      marginRight: "10px",
                      fontSize: "0.8rem",
                    }}
                  >
                    No Img
                  </div>
                )}

               
                <div>
                  <div className="fw-semibold text-dark">{dish.name}</div>
                  <div className="small text-muted">
                    {dish.totalOrdered} orders
                  </div>
                </div>
              </div>

             
              <Badge bg="success" pill>
                ₹{dish.totalRevenue}
              </Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No popular dishes yet.</p>
      )}
    </Card.Body>
  </Card>
</Col>

      </Row>
    </Container>
  );
}
