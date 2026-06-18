import { createBrowserRouter } from "react-router";
import Layout from "../layouts/Layout";
import MenuPages from "../features/menu/pages/MenuPage";
import Products from "../features/products/pages/Products";
import CashierPage from "../features/cashier/pages/CashierPage";
import Login from "../features/auth/pages/Login";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import GuestOnly from "./GuestOnly";
import SettingsPage from "../features/settings/pages/SettingsPage";
import FinancePage from "../features/finance/pages/FinancePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout>
          <DashboardPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestOnly>
        <Login />
      </GuestOnly>
    ),
  },
  {
    path: "/menu",
    element: (
      <ProtectedRoute>
        <Layout>
          <MenuPages />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/cashier",
    element: (
      <ProtectedRoute>
        <Layout>
          <CashierPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/products",
    element: (
      <ProtectedRoute>
        <Layout>
          <Products />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/settings",
    element: (
      <ProtectedRoute>
        <Layout>
          <SettingsPage />
        </Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/finance",
    element: (
      <ProtectedRoute>
        <Layout>
          <FinancePage />
        </Layout>
      </ProtectedRoute>
    ),
  },
]);

export default router;
