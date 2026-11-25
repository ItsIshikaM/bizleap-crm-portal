import { useState } from 'react';
import axios from 'axios';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/auth`;

export default function Login({ setToken }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/register' : '/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const { data } = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isRegister) {
        // Switch back to Sign In view and show confirmation banner instead of logging in
        setIsRegister(false);
        setName('');
        setPassword('');
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
      } else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center flow-canvas p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-[0_12px_40px_rgba(25,8,166,0.06)] border border-slate-100 p-8 sm:p-10">
        <div className="text-center mb-7">
          <div className="text-3xl font-extrabold tracking-tight text-[#1908A6]">
            BizLeap<span className="text-indigo-400">.</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-3">
            {isRegister ? 'Create your CRM account' : 'Sign in to Lead CRM'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isRegister
              ? 'Set up your workspace in seconds'
              : 'Welcome back! Enter your credentials to continue'}
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Ishika Mehere"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6] transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6] transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-[#1908A6] transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 bg-[#1908A6] hover:bg-[#130682] disabled:opacity-60 text-white font-semibold rounded-full shadow-md shadow-indigo-900/15 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {loading
                ? isRegister
                  ? 'Creating Account...'
                  : 'Signing In...'
                : isRegister
                ? 'Create Account'
                : 'Sign In'}
            </span>
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMsg('');
            }}
            className="text-[#1908A6] font-semibold hover:underline cursor-pointer"
          >
            {isRegister ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}