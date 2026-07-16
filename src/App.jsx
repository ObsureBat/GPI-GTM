import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext.jsx';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ToastProvider } from './auth/components/Toast.jsx';
import { ProtectedRoute } from './auth/components/ProtectedRoute.jsx';
import { SignIn, SignUp } from './auth/pages/AuthPages.jsx';
import { Layout } from './components/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { CollectionPage } from './pages/CollectionPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';
import { CartPage } from './pages/CartPage.jsx';
import { CheckoutPage } from './pages/CheckoutPage.jsx';
import { NotFound } from './pages/NotFound.jsx';
import AdminRoutes from './admin/AdminRoutes.jsx';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role="admin">
                  <AdminRoutes />
                </ProtectedRoute>
              }
            />
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/collections/:handle" element={<CollectionPage />} />
              <Route path="/products/:handle" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute role="customer">
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
