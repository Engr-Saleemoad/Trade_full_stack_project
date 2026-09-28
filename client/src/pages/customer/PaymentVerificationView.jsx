import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { submitDepositProofApi } from '../../services/api';
import {
  Upload,
  Image as ImageIcon,
  Copy,
  CheckCircle2,
  AlertCircle,
  Play,
  ArrowLeft,
  Shield,
  Zap,
} from 'lucide-react';

export const PaymentVerificationView = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get deposit context passed from previous modal/route or use defaults
  const gatewayName = location.state?.gatewayName || 'USDT ( BEP 20 )';
  const amount = location.state?.amount || '100';
  const walletAddress =
    location.state?.walletAddress || '0x86A04560103588BFA89B478E09F6d89C0C858eEB';

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select an image file (PNG, JPG, JPEG).');
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmNow = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedFile) {
      setErrorMsg('Please select and upload a payment proof screenshot before confirming.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('proofImage', selectedFile);
      formData.append('requestedAmount', amount);
      formData.append('gatewayType', gatewayName);
      formData.append('walletAddress', walletAddress);

      const response = await submitDepositProofApi(formData);

      setSuccessMsg(response.message || 'Payment proof submitted successfully!');

      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to submit payment proof. Try again.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0326] text-white p-4 sm:p-8 font-sans selection:bg-[#FF5A1F] selection:text-white flex flex-col justify-center items-center">
      <div className="max-w-3xl w-full space-y-8">
        {/* ------------------- 1. HEADER SECTION ------------------- */}
        <div className="flex items-center justify-between border-b border-purple-900/30 pb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-xs font-semibold text-[#A397C7] hover:text-[#FF5A1F] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white text-center">
            Pay with {gatewayName}
          </h1>
          <div className="w-20" />
        </div>

        {/* ------------------- 2. EMBEDDED VIDEO TUTORIAL COMPONENT ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 text-center">
          <h2 className="text-xs sm:text-sm font-bold text-[#FF5A1F] uppercase tracking-wider">
            HOW TO TRANSFER USDT(BEP20) TO BINANCE ACCOUNT
          </h2>
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-purple-900/60 bg-black/60 shadow-inner flex items-center justify-center">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1"
              title="HOW TO TRANSFER USDT(BEP20) TO BINANCE ACCOUNT"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* ------------------- 3. FORM INSTRUCTION BOX & DETAILS (image_2de2c3.jpg) ------------------- */}
        <div className="bg-[#130833] border border-purple-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2 border-b border-purple-900/30 pb-4">
            <h3 className="text-base font-extrabold text-[#FF5A1F] tracking-wide uppercase">
              Please follow the instruction below
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
              You have requested to deposit <strong className="text-[#FF5A1F]">{amount} USD</strong>, Please pay <strong className="text-[#FF5A1F]">{amount} USDT</strong> for successful payment
            </p>
            <p className="text-xs text-[#A397C7]">
              Deposite USDT in USDT BEP20 wallet Address
            </p>
          </div>

          {/* Crypto Wallet Receiver Address Field */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white">Destination Wallet Address</label>
            <div className="flex items-center space-x-2 bg-[#0B0326] border border-purple-800/50 rounded-xl p-3">
              <span className="font-mono text-xs sm:text-sm text-amber-300 break-all flex-1">
                {walletAddress}
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="px-3 py-1.5 rounded-lg bg-[#FF5A1F] hover:bg-[#e04c15] text-white text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Error & Success Alerts */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center space-x-3 text-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ------------------- 4. PROOF SCREENSHOT UPLOAD INTERFACE ------------------- */}
          <div className="space-y-4 pt-2">
            <label className="block text-xs font-semibold text-[#A397C7]">Upload Proof</label>

            {/* Square Box Selector Layout with Thumbnail Preview */}
            <div className="w-48 h-48 mx-auto rounded-2xl bg-[#0B0326] border-2 border-dashed border-purple-800/60 p-2 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Payment Proof Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center space-y-2 text-[#A397C7]">
                  <ImageIcon className="w-12 h-12 mx-auto text-purple-400" />
                  <p className="text-[11px]">No proof image selected</p>
                </div>
              )}
            </div>

            {/* Hidden HTML File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Select Upload Proof Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white text-xs font-bold tracking-wide transition-all shadow-md cursor-pointer inline-flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Select Upload Proof</span>
              </button>
            </div>
          </div>

          {/* ------------------- 5. PRIMARY SUBMISSION BUTTON ------------------- */}
          <div className="pt-4 border-t border-purple-900/40">
            <button
              onClick={handleConfirmNow}
              disabled={submitting}
              className="w-full py-4 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-sm tracking-widest uppercase shadow-xl shadow-[#FF5A1F]/30 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting Proof...' : 'Confirm Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
