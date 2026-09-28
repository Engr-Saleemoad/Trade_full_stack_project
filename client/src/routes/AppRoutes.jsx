import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GlobalProfitHub } from '../pages/customer/GlobalProfitHub';
import { LoginPage } from '../pages/customer/LoginPage';
import { RegisterPage } from '../pages/customer/RegisterPage';
import { ForgotPasswordPage } from '../pages/customer/ForgotPasswordPage';
import { InvestmentPlansView } from '../pages/customer/InvestmentPlansView';
import { AddFundView } from '../pages/customer/AddFundView';
import { PaymentVerificationView } from '../pages/customer/PaymentVerificationView';
import { FundHistoryView } from '../pages/customer/FundHistoryView';
import { PayoutView } from '../pages/customer/PayoutView';
import { PayoutHistoryView } from '../pages/customer/PayoutHistoryView';
import { TaskInvestHistoryView } from '../pages/customer/TaskInvestHistoryView';
import { TransactionHistoryView } from '../pages/customer/TransactionHistoryView';
import { CustomerLayout } from '../layouts/CustomerLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { CustomerHome } from '../pages/customer/CustomerHome';
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminDepositRequests } from '../pages/admin/AdminDepositRequests';
import { AdminPayoutRequests } from '../pages/admin/AdminPayoutRequests';
import { AdminPayoutMethods } from '../pages/admin/AdminPayoutMethods';
import { AdminPayoutLogs } from '../pages/admin/AdminPayoutLogs';
import { AdminPlans } from '../pages/admin/AdminPlans';
import { AdminManualGateway } from '../pages/admin/AdminManualGateway';
import { AdminReferral } from '../pages/admin/AdminReferral';
import { AdminNotices } from '../pages/admin/AdminNotices';
import { AdminSettings } from '../pages/admin/AdminSettings';
import { AdminTransferRequests } from '../pages/admin/AdminTransferRequests';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { ProtectedAdminRoute } from './ProtectedAdminRoute';
import { TransferView } from '../pages/customer/TransferView';

import { ProfilePage } from '../pages/customer/ProfilePage';

import { AdminTransactions } from '../pages/admin/AdminTransactions';
import { AdminInvestments } from '../pages/admin/AdminInvestments';
import { AdminSubAdmins } from '../pages/admin/AdminSubAdmins';
import { AdminDeviceLogs } from '../pages/admin/AdminDeviceLogs';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Main Global Profit Hub Single Page Application */}
      <Route path="/" element={<GlobalProfitHub />} />

      {/* Auth & Dedicated Customer View Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/plans" element={<InvestmentPlansView />} />
      <Route path="/add-fund" element={<AddFundView />} />
      <Route path="/payment-verification" element={<PaymentVerificationView />} />
      <Route path="/fund-history" element={<FundHistoryView />} />
      <Route path="/payout" element={<PayoutView />} />
      <Route path="/payout-history" element={<PayoutHistoryView />} />
      <Route path="/transfer" element={<TransferView />} />
      <Route path="/task" element={<TaskInvestHistoryView />} />
      <Route path="/transaction" element={<TransactionHistoryView />} />

      {/* Customer Portal Routes */}
      <Route path="/portal" element={<CustomerLayout />}>
        <Route index element={<CustomerHome />} />
      </Route>

      <Route path="/dashboard" element={<CustomerLayout />}>
        <Route index element={<CustomerDashboard />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="plans" element={<InvestmentPlansView />} />
        <Route path="add-fund" element={<AddFundView />} />
        <Route path="payment-verification" element={<PaymentVerificationView />} />
        <Route path="fund-history" element={<FundHistoryView />} />
        <Route path="transfer" element={<TransferView />} />
        <Route path="payout" element={<PayoutView />} />
        <Route path="payout-history" element={<PayoutHistoryView />} />
        <Route path="task" element={<TaskInvestHistoryView />} />
        <Route path="transaction" element={<TransactionHistoryView />} />
      </Route>

      {/* Admin Auth Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Portal Routes (Restricted from Customers) */}
      <Route element={<ProtectedAdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="notice" element={<AdminNotices />} />
          <Route path="notice-board" element={<AdminNotices />} />
          <Route path="notifications" element={<AdminNotices />} />
          <Route path="deposit-request" element={<AdminDepositRequests />} />
          <Route path="deposits" element={<AdminDepositRequests />} />
          <Route path="payment-log" element={<AdminDepositRequests />} />
          <Route path="payout" element={<AdminPayoutRequests />} />
          <Route path="payout-request" element={<AdminPayoutRequests />} />
          <Route path="payout-requests" element={<AdminPayoutRequests />} />
          <Route path="payouts" element={<AdminPayoutRequests />} />
          <Route path="payout-methods" element={<AdminPayoutMethods />} />
          <Route path="payout-settings" element={<AdminPayoutMethods />} />
          <Route path="payout-log" element={<AdminPayoutLogs />} />
          <Route path="payout-logs" element={<AdminPayoutLogs />} />
          <Route path="plans" element={<AdminPlans />} />
          <Route path="plan" element={<AdminPlans />} />
          <Route path="manual-gateway" element={<AdminManualGateway />} />
          <Route path="gateways" element={<AdminManualGateway />} />
          <Route path="gateway" element={<AdminManualGateway />} />
          <Route path="payment-methods" element={<AdminManualGateway />} />
          <Route path="referral" element={<AdminReferral />} />
          <Route path="referrals" element={<AdminReferral />} />
          <Route path="commissions" element={<AdminReferral />} />
          <Route path="sub-admins" element={<AdminSubAdmins />} />
          <Route path="sub-admin" element={<AdminSubAdmins />} />
          <Route path="roles" element={<AdminSubAdmins />} />
          <Route path="device-logs" element={<AdminDeviceLogs />} />
          <Route path="user-device-details" element={<AdminDeviceLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="transfer-requests" element={<AdminTransferRequests />} />
          <Route path="transfers" element={<AdminTransferRequests />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="investments" element={<AdminInvestments />} />
        </Route>
      </Route>







      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
