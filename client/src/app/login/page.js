"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Phone, Mail, Lock, ShieldCheck } from 'lucide-react';
import api from '../../lib/api';

export default function Login() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' | 'email'
  const [step, setStep] = useState(1); // 1: Phone input, 2: Verification code
  const [loading, setLoading] = useState(false);
  
  // Phone State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');

  const finishLogin = (token, refreshToken, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    router.push('/dashboard');
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/login-email', { email, password });
      
      if (res.data.status === 'success') {
        const { token, refreshToken, user } = res.data.data;
        finishLogin(token, refreshToken, user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/send-code', { 
        phoneNumber: phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}` 
      });
      
      if (res.data.status === 'success') {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length < 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber}`;
      const res = await api.post('/auth/verify-code', { 
        phoneNumber: formattedPhone,
        code: verificationCode
      });
      
      if (res.data.status === 'success') {
        const { token, refreshToken, user } = res.data.data;
        finishLogin(token, refreshToken, user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header/Logo */}
        <div className="bg-primary-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -tralslate-y-12 translate-x-12 w-32 h-32 bg-primary-500 rounded-full opacity-50 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-32 h-32 bg-primary-700 rounded-full opacity-50 blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform -rotate-6">
              <span className="text-primary-600 font-black text-3xl">BV</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">BillVault</h1>
            <p className="text-primary-100 font-medium">Smart expense tracking</p>
          </div>
        </div>

        {/* Action Area */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => { setLoginMethod('phone'); setError(''); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'phone' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </button>
              <button
                type="button"
                onClick={() => { setLoginMethod('email'); setError(''); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 text-sm font-medium rounded-lg transition-colors ${loginMethod === 'email' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          )}

          {loginMethod === 'email' && step === 1 ? (
             <form onSubmit={handleEmailLogin}>
             <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Sign In with Email</h2>
             
             <div className="mb-4">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                 Email Address
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                   <Mail className="w-5 h-5" />
                 </div>
                 <input
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="you@example.com"
                   className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                 />
               </div>
             </div>

             <div className="mb-6">
               <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                 Password
               </label>
               <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                   <Lock className="w-5 h-5" />
                 </div>
                 <input
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                 />
               </div>
             </div>

             <button
               type="submit"
               disabled={loading}
               className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-primary-500/20 flex justify-center items-center"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
             </button>
             
             <p className="mt-4 text-center text-xs text-slate-500">
              Dev Mode: Any password will work!
             </p>
           </form>
          ) : step === 1 ? (
            <form onSubmit={handleSendCode}>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Welcome Back</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-primary-500/20 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="text-sm text-slate-500 dark:text-slate-400 mb-6 hover:text-slate-800 dark:hover:text-white flex items-center transition"
              >
                &larr; Back to phone number
              </button>
              
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Enter Code</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                We sent a 6-digit code to {phoneNumber}
              </p>
              
              <div className="mb-6">
                <input
                  type="text"
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="block w-full text-center tracking-[0.5em] font-mono text-2xl py-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all shadow-md shadow-primary-500/20 flex justify-center items-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
              </button>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
}
