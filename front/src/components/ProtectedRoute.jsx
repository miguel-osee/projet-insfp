import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {

  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    // 🔥 Redirection selon rôle attendu
    return (
      <Navigate 
        to={allowedRole === "ADMIN" ? "/login-admin" : "/login-stagiaire"} 
        replace 
      />
    );
  }

  const user = JSON.parse(userString);

  if (user.role !== allowedRole) {
    return (
      <Navigate 
        to={allowedRole === "ADMIN" ? "/login-admin" : "/login-stagiaire"} 
        replace 
      />
    );
  }

  return children;
}
