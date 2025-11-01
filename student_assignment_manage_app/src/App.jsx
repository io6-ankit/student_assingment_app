import { useEffect, useState } from "react";
import LoginPage from "./components/auth/login-page";
import AdminDashboard from "./components/admin/admin-dashboard";
import StudentDashboard from "./components/student/student-dashboard";
import { AuthContext } from "./context/auth-context";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
      setUserRole(user.role);
      setIsLoggedIn(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (email, password, role) => {
    const user = { email, password, role, id: Date.now().toString() };
    localStorage.setItem("currentUser", JSON.stringify(user));
    setCurrentUser(user);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setUserRole(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, userRole, handleLogout }}>
      <div>
        {userRole === "admin" && <AdminDashboard />}
        {userRole === "student" && <StudentDashboard />}
      </div>
    </AuthContext.Provider>
  );
}
