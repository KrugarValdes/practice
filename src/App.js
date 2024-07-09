import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Operations from "./components/Operations";
import AddOperation from "./components/AddOperation";
import EditOperation from "./components/EditOperation";
import Analytics from "./components/Analytics";

const App = () => {
  return (
    <Router>
      <Helmet>
        <title>FitTrack</title>
        <link rel="icon" href="/logo1.ico" />
      </Helmet>
      <HeaderWrapper />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/operations" element={<Operations />} />
        <Route path="/add-operation" element={<AddOperation />} />
        <Route path="/edit-operation/:id" element={<EditOperation />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  );
};

const HeaderWrapper = () => {
  const location = useLocation();
  const noHeaderRoutes = ["/login", "/register"];

  if (noHeaderRoutes.includes(location.pathname)) {
    return null;
  }

  return <Header />;
};

export default App;
