import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";
import AuthPage from "./components/AuthPage";
import Dashboard from "./components/Dashboard";
import CustomersPage from "./components/CustomersPage";
import InteractionsPage from "./components/InteractionsPage";
import TasksPage from "./components/TasksPage";
import MetricsPage from "./components/MetricsPage";
import { getMe, apiLogout } from "./utils/api";
import { ThemeContextProvider, useTheme } from "./components/ThemeContext";

// Create a user context to store user info and auth functions
export const UserContext = createContext(null);

// Layout and app shell with header/sidebar structure
function AppShell({ children }) {
  const { user, logout } = React.useContext(UserContext);
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`app-shell${sidebarOpen ? " sidebar-open" : ""}`}>
      <header className="crm-header">
        <button className="sidebar-toggle" onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle sidebar">
          ☰
        </button>
        <h1 className="crm-title"><img src="/favicon.ico" alt="CRM Logo" className="crm-logo" /> CRM</h1>
        <section className="header-right">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Theme toggle">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <span className="crm-user-info">
            {user && <>{user.name} ({user.email})</>}
          </span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </section>
      </header>
      <aside className="crm-sidebar">
        <nav>
          <ul>
            <li><Link to="/dashboard" onClick={() => setSidebarOpen(false)}>Dashboard</Link></li>
            <li><Link to="/customers" onClick={() => setSidebarOpen(false)}>Customers</Link></li>
            <li><Link to="/interactions" onClick={() => setSidebarOpen(false)}>Interactions</Link></li>
            <li><Link to="/tasks" onClick={() => setSidebarOpen(false)}>Tasks</Link></li>
            <li><Link to="/metrics" onClick={() => setSidebarOpen(false)}>Metrics</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="crm-main">
        {children}
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const [user, setUser] = useState(() => {
    try {
      const localUser = localStorage.getItem("crm_user");
      return localUser ? JSON.parse(localUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("crm_token") || "");

  // PUBLIC_INTERFACE
  const login = async (token, user) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("crm_token", token);
    localStorage.setItem("crm_user", JSON.stringify(user));
  };
  // PUBLIC_INTERFACE
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    apiLogout();
  };

  // On initial load, fetch user profile if token exists and user missing (tab refresh)
  useEffect(() => {
    if (!user && token) {
      getMe(token)
        .then(data => {
          if (data.status === "ok") {
            setUser(data.user);
            localStorage.setItem("crm_user", JSON.stringify(data.user));
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
    // eslint-disable-next-line
  }, []);

  return (
    <ThemeContextProvider>
      <UserContext.Provider value={{ user, setUser, token, login, logout }}>
        <Router>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="login" />} />
            <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="signup" />} />
            <Route element={user ? <AppShell /> : <Navigate to="/login" />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/interactions" element={<InteractionsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
            </Route>
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
          </Routes>
        </Router>
      </UserContext.Provider>
    </ThemeContextProvider>
  );
}

export default App;
