import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "@/store/useTestStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo-idn.png";
import { Lock } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAdminStore((s) => s.login);
  const isAdmin = useAdminStore((s) => s.isAdmin);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  if (isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleLogin = () => {
    if (login(user, pass)) {
      navigate("/admin");
    } else {
      setError("Username atau password salah");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="glass-card rounded-2xl p-8 space-y-6 text-center">
          <img src={logo} alt="IDN Boarding School" className="h-16 mx-auto" />
          <div>
            <div className="w-12 h-12 mx-auto rounded-full gradient-primary flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">Admin Login</h1>
          </div>
          <div className="space-y-3 text-left">
            <Input placeholder="Username" value={user} onChange={(e) => { setUser(e.target.value); setError(""); }} />
            <Input placeholder="Password" type="password" value={pass} onChange={(e) => { setPass(e.target.value); setError(""); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            <Button onClick={handleLogin} className="w-full gradient-primary text-primary-foreground">Masuk</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
