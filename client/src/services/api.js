import API from '../api/axios';

const api = API;


/**
 * Health check verification route
 */
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

/**
 * Register user auth endpoint call
 */
export const registerUserApi = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user auth endpoint call
 */
export const loginUserApi = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

/**
 * Admin login endpoint call
 */
export const adminLoginApi = async (credentials) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

/**
 * Fetch administrative dashboard metrics
 */
export const fetchAdminDashboardMetricsApi = async () => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.get('/admin/dashboard-metrics', {
    headers: {
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

/**
 * Forgot password request reset link call
 */
export const forgotPasswordApi = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

/**
 * Fetch authenticated user dashboard statistics
 */
export const fetchDashboardStatsApi = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/user/dashboard-stats', {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Submit deposit payment proof screenshot
 */
export const submitDepositProofApi = async (formData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/deposit/submit-proof', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Fetch user deposit fund history records
 */
export const fetchFundHistoryApi = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/deposit/my-history', {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Submit new payout withdrawal request
 */
export const requestPayoutApi = async (payoutData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/payout/request', payoutData, {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Fetch user payout withdrawal history records
 */
export const fetchPayoutHistoryApi = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/payout/my-history', {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Fetch active investment plans for countdown & claims
 */
export const fetchActiveInvestmentsApi = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/invest/my-active-plans', {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Purchase investment plan directly from main balance
 */
export const purchasePlanApi = async (planData) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/invest/purchase', planData, {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Claim 24h ROI interest reward
 */
export const claimInvestRewardApi = async (investmentId) => {
  const token = localStorage.getItem('token');
  const response = await api.post(
    '/invest/claim-reward',
    { investmentId },
    {
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
    }
  );
  return response.data;
};

/**
 * Fetch global admin settings (including timer interval)
 */
export const fetchAdminSettingsApi = async () => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.get('/admin/settings', {
    headers: {
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

/**
 * Update global investment claim timer duration
 */
export const updateAdminTimerSettingApi = async (investmentIntervalMinutes) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.put(
    '/admin/settings/timer',
    { investmentIntervalMinutes },
    {
      headers: {
        Authorization: `Bearer ${adminToken || ''}`,
      },
    }
  );
  return response.data;
};

/**
 * Fetch transaction ledger history
 */
export const fetchMyLedgerApi = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/transactions/my-ledger', {
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
  });
  return response.data;
};

/**
 * Update user account status (Active, Suspended, Blocked)
 */
export const updateUserStatusApi = async (userId, newStatus) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.patch(
    `/admin/users/${userId}/status`,
    { newStatus },
    {
      headers: {
        Authorization: `Bearer ${adminToken || ''}`,
      },
    }
  );
  return response.data;
};

/**
 * Fetch latest active announcement notice for customer popup
 */
export const fetchActiveNoticeApi = async () => {
  const response = await api.get('/notices/active');
  return response.data;
};

/**
 * Fetch all notices for admin notice manager
 */
export const fetchAdminNoticesApi = async () => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.get('/admin/notices', {
    headers: {
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

/**
 * Create a new notice announcement (FormData for image file support)
 */
export const createNoticeApi = async (formData) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.post('/admin/notices', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

/**
 * Update an existing notice
 */
export const updateNoticeApi = async (id, formData) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.put(`/admin/notices/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

/**
 * Toggle notice active/inactive state
 */
export const toggleNoticeStatusApi = async (id) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.patch(`/admin/notices/${id}/toggle`, {}, {
    headers: {
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

/**
 * Delete a notice permanently
 */
export const deleteNoticeApi = async (id) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await api.delete(`/admin/notices/${id}`, {
    headers: {
      Authorization: `Bearer ${adminToken || ''}`,
    },
  });
  return response.data;
};

export default api;
