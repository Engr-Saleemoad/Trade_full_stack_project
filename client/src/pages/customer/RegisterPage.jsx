import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUserApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Shield, ChevronRight, AlertCircle, CheckCircle2, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required.';
    if (!formData.username.trim()) newErrors.username = 'Username is required.';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone Number is required.';

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMsg('');

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const response = await registerUserApi(payload);

      if (response.token) {
        login(response.token, response.user || response.data);
      }

      setSuccessMsg(response.message || 'Registration successful!');
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
      });

      // Redirect to user dashboard after brief success display
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setServerError(message);

      // Map backend error directly to individual input field error if duplicate
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('username')) {
        setErrors((prev) => ({ ...prev, username: message }));
      } else if (lowerMsg.includes('email')) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (lowerMsg.includes('phone')) {
        setErrors((prev) => ({ ...prev, phone: message }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0326] text-white flex flex-col font-sans selection:bg-[#FF5A1F] selection:text-white">
      {/* ------------------- TOP HEADER BANNER ------------------- */}
      <section className="relative py-16 bg-gradient-to-b from-[#180A47] via-[#100436] to-[#0B0326] border-b border-purple-900/30 overflow-hidden text-center">
        {/* Background Cyber Art Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#FF5A1F_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="relative z-10 space-y-2 max-w-xl mx-auto px-4">
          <h1 className="text-4xl font-extrabold text-white tracking-wide">Register</h1>
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#A397C7]">
            <Link to="/" className="hover:text-[#FF5A1F] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#FF5A1F]" />
            <span className="text-white">Register</span>
          </div>
        </div>
      </section>

      {/* ------------------- FORM CONTAINER ------------------- */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12">
        <div className="bg-[#130833] border border-purple-900/40 border-t-4 border-l-4 border-t-[#FF5A1F] border-l-[#FF5A1F] rounded-2xl p-6 sm:p-10 shadow-2xl relative">
          
          <div className="mb-8 border-b border-purple-900/40 pb-4">
            <h2 className="text-2xl font-bold text-white tracking-tight">Register Here</h2>
            <p className="text-xs text-[#A397C7] mt-1">Create your Global Profit Hub account to begin investing.</p>
          </div>

          {/* Error & Success Messages */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid 1: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                  First Name <span className="text-[#FF5A1F]">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className={`w-full px-4 py-3 bg-[#0B0326]/90 border ${
                    errors.firstName ? 'border-rose-500' : 'border-purple-900/50'
                  } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                />
                {errors.firstName && <p className="text-[11px] text-rose-400 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                  Last Name <span className="text-[#FF5A1F]">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className={`w-full px-4 py-3 bg-[#0B0326]/90 border ${
                    errors.lastName ? 'border-rose-500' : 'border-purple-900/50'
                  } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                />
                {errors.lastName && <p className="text-[11px] text-rose-400 mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Grid 2: Username & Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                  Username <span className="text-[#FF5A1F]">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  className={`w-full px-4 py-3 bg-[#0B0326]/90 border ${
                    errors.username ? 'border-rose-500' : 'border-purple-900/50'
                  } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                />
                {errors.username && <p className="text-[11px] text-rose-400 mt-1 font-semibold">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                  Email Address <span className="text-[#FF5A1F]">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={`w-full px-4 py-3 bg-[#0B0326]/90 border ${
                    errors.email ? 'border-rose-500' : 'border-purple-900/50'
                  } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                />
                {errors.email && <p className="text-[11px] text-rose-400 mt-1 font-semibold">{errors.email}</p>}
              </div>
            </div>

            {/* Streamlined Single Phone Input with Country Code */}
            <div>
              <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                Mobile / Phone Number (Include Country Code) <span className="text-[#FF5A1F]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+923001234567 or +1234567890"
                  className={`w-full pl-10 pr-4 py-3 bg-[#0B0326]/90 border ${
                    errors.phone ? 'border-rose-500' : 'border-purple-900/50'
                  } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                />
              </div>
              {errors.phone && <p className="text-[11px] text-rose-400 mt-1 font-semibold">{errors.phone}</p>}
            </div>

            {/* Grid 3: Password & Confirm Password with Eye Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                  Password <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={`w-full pl-4 pr-10 py-3 bg-[#0B0326]/90 border ${
                      errors.password ? 'border-rose-500' : 'border-purple-900/50'
                    } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] text-rose-400 mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A397C7] mb-2">
                  Confirm Password <span className="text-[#FF5A1F]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm Password"
                    className={`w-full pl-4 pr-10 py-3 bg-[#0B0326]/90 border ${
                      errors.confirmPassword ? 'border-rose-500' : 'border-purple-900/50'
                    } rounded-xl text-xs text-white placeholder:text-purple-300/30 focus:outline-none focus:border-[#FF5A1F] transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-[11px] text-rose-400 mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="pt-2">
              <label className="flex items-center space-x-3 cursor-pointer text-xs text-[#A397C7]">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded bg-[#0B0326] border-purple-800 text-[#FF5A1F] focus:ring-0 cursor-pointer"
                />
                <span>I agree to the terms and conditions.</span>
              </label>
              {errors.agreeTerms && <p className="text-[11px] text-rose-400 mt-1">{errors.agreeTerms}</p>}
            </div>

            {/* Submit Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-bold text-sm tracking-wider uppercase shadow-xl shadow-[#FF5A1F]/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Registering...' : 'REGISTER'}
              </button>
            </div>

            {/* Login Link below REGISTER button */}
            <div className="text-center pt-2">
              <p className="text-xs text-[#A397C7]">
                Already have an account?{' '}
                <Link to="/login" className="text-[#FF5A1F] font-bold hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
