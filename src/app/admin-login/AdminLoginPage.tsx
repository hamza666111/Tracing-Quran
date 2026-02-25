import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Shield } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      const session = data.session;
      const isAdmin = session?.user?.app_metadata?.role === "admin";
      if (isAdmin) {
        navigate("/admin-dashboard", { replace: true });
      }
    };

    checkSession();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const isAdmin = data.session?.user?.app_metadata?.role === "admin";
    if (!isAdmin) {
      setError("This account is not authorized for admin access.");
      await supabaseClient.auth.signOut();
      setLoading(false);
      return;
    }

    navigate("/admin-dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#C6A75E]/10 p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#C6A75E]/10 text-[#C6A75E]">
            <Shield />
          </div>
          <h1 className="text-3xl text-[#0F3D3E]">Admin Login</h1>
          <p className="text-sm text-[#0F3D3E]/60">
            Restricted access. Please sign in with your admin credentials.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#0F3D3E] text-sm">
              <Mail className="w-4 h-4 text-[#C6A75E]" />
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-white outline-none text-[#0F3D3E]"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#0F3D3E] text-sm">
              <Lock className="w-4 h-4 text-[#C6A75E]" />
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-[#C6A75E]/20 focus:border-[#C6A75E] bg-white outline-none text-[#0F3D3E]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C6A75E] text-white rounded-xl hover:bg-[#B89650] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="w-full text-sm text-[#0F3D3E]/60 hover:text-[#0F3D3E]"
        >
          ← Back to website
        </button>
      </div>
    </div>
  );
}
