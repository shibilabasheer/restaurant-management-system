import { StrictMode ,useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from 'react-redux'
import Layout from './components/Layout.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useDispatch } from "react-redux";
import { Store } from './redux/store.js'
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import AllUsers from './pages/admin/AllUsers.jsx';
import Tables from './pages/admin/Tables.jsx';
import ReservationsList from './pages/admin/ReservationList.jsx';
import Staffs from './pages/admin/Staffs.jsx';
import StaffDashboard from './pages/admin/StaffDashboard.jsx';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Menu from './pages/admin/Menu.jsx';
import Menus from './pages/Menus.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Reservations from './pages/Reservations.jsx';
import Category from './pages/Category.jsx';
import API, { setAuthToken } from './helpers/api';
import { setUser, logout, loginAction } from './redux/slices/userSlice'; // adjust names if different
import AllOrders from './pages/admin/AllOrders.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import OrdersList from './pages/OrdersList.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';

const router = createBrowserRouter([
  { path: '/login', element: <Login />, errorElement: <ErrorPage /> },
  { path: '/register', element: <Register />, errorElement: <ErrorPage /> },
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
    ],
  },
  {
      path: 'menu',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Menus />
        },
      ],
  },
  {
    path: "category/:id",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Category />
      },
    ],
  },
  {
  element: <ProtectedRoute />,
  children: [
  {
    path: "menus",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Menu />
      },
    ],
  },
  {
    path: "allusers",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AllUsers/>
      },
    ],
  },
  {
    path: "allorders",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <AllOrders/>
      },
    ],
  },
  {
    path: "tables",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Tables/>
      },
    ],
  },
  {
    path: "reservationlist",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <ReservationsList/>
      },
    ],
  },
  {
    path: "staffs",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Staffs/>
      },
    ],
  },
  {
    path: "staffdashboard",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <StaffDashboard/>
      },
    ],
  },
  {
      path: 'adminprofile',
      element: <AdminLayout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <ProfilePage />
        },
      ],
  },
  {
      path: 'profile',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <ProfilePage />
        },
      ],
  },
  {
      path: 'cart',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Cart />
        },
      ],
  },
  {
      path: 'checkout',
      element: <Layout />,
      errorElement: <ErrorPage />,
      children: [
        {
          index: true,
          element: <Checkout />
        },
      ],
  },
   {
    path: "reservations",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Reservations/>
      },
    ],
  },
  {
    path: "orders/:id",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <OrderDetails />
      },
    ],
  },
  {
    path: "orderdetails/:id",
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <OrderDetails />
      },
    ],
  },
  {
    path: "orders",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <OrdersList />
      },
    ],
  },
  {
    path: "/payment-success/:id",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <PaymentSuccess />
      },
    ],
  },
]}
]);

function AppInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setAuthToken(token);

    API.get('/auth/me')
      .then(({ data }) => {
        dispatch(setUser(data));
        dispatch(loginAction({ token, ...data }));
      })
      .catch((err) => {
        console.warn('Token invalid or expired', err?.response?.data || err.message);
        setAuthToken(null);
        dispatch(logout());
      });
  }, [dispatch]);

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={Store}>
      <AppInitializer>
      <RouterProvider router={router} />
      <ToastContainer position="top-right" autoClose={3000} />
      </AppInitializer>
    </Provider>
  </StrictMode>,
)

