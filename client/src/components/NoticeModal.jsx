import React, { useState, useEffect } from 'react';
import { fetchActiveNoticeApi } from '../services/api';
import { Megaphone, X, Check, ShieldAlert, Zap, AlertTriangle, Info } from 'lucide-react';

export const NoticeModal = () => {
  const [notice, setNotice] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkNotice = async () => {
      try {
        const res = await fetchActiveNoticeApi();
        if (res && res.data && res.data.isActive) {
          const activeItem = res.data;
          const isDismissed = sessionStorage.getItem(`notice_dismissed_${activeItem._id}`);
          if (!isDismissed) {
            setNotice(activeItem);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.warn('[Notice Modal] Failed to fetch active notice:', err.message);
      }
    };

    checkNotice();
  }, []);

  const handleDismiss = () => {
    if (notice && notice._id) {
      sessionStorage.setItem(`notice_dismissed_${notice._id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !notice) return null;

  const priorityStyles = {
    Urgent: {
      bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: ShieldAlert,
      label: 'URGENT NOTICE',
    },
    Important: {
      bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
      label: 'IMPORTANT ANNOUNCEMENT',
    },
    Normal: {
      bg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      icon: Info,
      label: 'ANNOUNCEMENT',
    },
  };

  const currentPriority = priorityStyles[notice.priority] || priorityStyles.Normal;
  const PriorityIcon = currentPriority.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B0326] border border-purple-800/60 rounded-3xl w-[92%] sm:w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar p-6 space-y-5 shadow-2xl relative overflow-hidden">
        
        {/* Top Priority Ribbon & Close Button */}
        <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${currentPriority.bg}`}>
              <PriorityIcon className="w-3.5 h-3.5" />
              <span>{currentPriority.label}</span>
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-purple-950 border border-purple-800/40 text-purple-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Optional Banner Image Header */}
        {notice.imageUrl ? (
          <div className="w-full max-h-52 rounded-2xl overflow-hidden border border-purple-900/40 bg-black shadow-inner">
            <img
              src={
                notice.imageUrl.startsWith('http')
                  ? notice.imageUrl
                  : `http://localhost:5000${notice.imageUrl}`
              }
              alt={notice.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60';
              }}
            />
          </div>
        ) : null}

        {/* Notice Title */}
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
            {notice.title}
          </h2>
          <p className="text-[11px] text-purple-400 font-mono">
            Published: {new Date(notice.createdAt || Date.now()).toLocaleDateString()}
          </p>
        </div>

        {/* Message Content Body */}
        <div className="p-4 rounded-2xl bg-[#07021A] border border-purple-900/40 text-xs text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
          {notice.description}
        </div>

        {/* Bottom Dismiss Action Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-3.5 px-6 rounded-xl bg-[#FF5A1F] hover:bg-[#e04c15] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF5A1F]/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>I Understand / Got It</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeModal;
