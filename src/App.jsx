import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import ManageUser from "./pages/ManageUser";
import Record from "./pages/Record";
import Setting from "./pages/Setting";
import RequestMedicine from "./pages/RequestMedicine";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="sidebar" element={<Sidebar />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="manage-user" element={<ManageUser />} />
        <Route path="records" element={<Record />} />
        <Route path="requestmedicine" element={<RequestMedicine />} />
        <Route path="settings" element={<Setting />} />
        ``
      </Routes>
    </Router>
  );
}

export default App;
