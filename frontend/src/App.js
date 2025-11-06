import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import AdminPanel from "@/components/AdminPanel";
import IncomePage from "@/components/IncomePage";
import ExpensePage from "@/components/ExpensePage";
import IncomeArchive from "@/components/IncomeArchive";
import ExpenseArchive from "@/components/ExpenseArchive";
import RevenuePage from "@/components/RevenuePage";
import RecountPage from "@/components/RecountPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              currentUser ? 
                <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              currentUser ? 
                <Dashboard user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/admin" 
            element={
              currentUser && currentUser.role === 'admin' ? 
                <AdminPanel user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/dashboard" replace />
            } 
          />
          <Route 
            path="/income" 
            element={
              currentUser ? 
                <IncomePage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/expense" 
            element={
              currentUser ? 
                <ExpensePage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/income-archive" 
            element={
              currentUser ? 
                <IncomeArchive user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/expense-archive" 
            element={
              currentUser ? 
                <ExpenseArchive user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/revenue" 
            element={
              currentUser ? 
                <RevenuePage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/recount" 
            element={
              currentUser ? 
                <RecountPage user={currentUser} onLogout={handleLogout} /> : 
                <Navigate to="/" replace />
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;