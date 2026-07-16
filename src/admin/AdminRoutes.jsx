import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { AdminProducts } from './pages/AdminProducts.jsx';
import { AdminOrders } from './pages/AdminOrders.jsx';
import { AdminCategories } from './pages/AdminCategories.jsx';

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Navigate to="/sign-in?redirect=/admin/dashboard" replace />} />
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
