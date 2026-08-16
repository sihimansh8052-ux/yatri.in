import { Navigate } from "react-router-dom";
import AuthPanel from "../components/AuthPanel";
import useSeo from "../hooks/useSeo";

export default function AuthPage({ user, onAuthenticated }) {
  useSeo("Login | Yatri.in");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AuthPanel onAuthenticated={onAuthenticated} />;
}
