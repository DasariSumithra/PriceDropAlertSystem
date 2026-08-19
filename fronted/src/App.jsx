import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import PriceHistory from "./pages/PriceHistory";

import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";


function App() {

    return (

        <Routes>

            {/* Public Routes */}

            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* Protected Routes */}

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/add-product"
                element={
                    <ProtectedRoute>
                        <AddProduct />
                    </ProtectedRoute>
                }
            />


            <Route
                path="/edit-product/:id"
                element={
                    <ProtectedRoute>
                        <EditProduct />
                    </ProtectedRoute>
                }
            />


            {/* Price History */}

            <Route
                path="/products/:id/history"
                element={
                    <ProtectedRoute>
                        <PriceHistory />
                    </ProtectedRoute>
                }
            />


            {/* 404 */}

            <Route
                path="*"
                element={<NotFound />}
            />

        </Routes>

    );

}


export default App;