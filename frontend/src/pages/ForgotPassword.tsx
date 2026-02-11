import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Password recovery placeholder. Add email/OTP flow here.
        </p>
        <Link to="/login" className="mt-4 inline-block text-cyan-700 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
