"use client";

import { useState } from 'react';
import { Key, Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';

export default function ProfileSettings() {
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleResetPassword = async () => {
    setResetStatus('loading');
    try {
      const res = await fetch('/api/auth/reset-password', { method: 'POST' });
      if (res.ok) {
        setResetStatus('success');
      } else {
        setResetStatus('error');
      }
    } catch (error) {
      setResetStatus('error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setDeleteStatus('loading');
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' });
      if (res.ok) {
        setDeleteStatus('success');
        window.location.href = '/';
      } else {
        setDeleteStatus('error');
      }
    } catch (error) {
      setDeleteStatus('error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-blue-500" />
          Password Reset
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          We will send a password reset link to your registered email address.
        </p>
        <button
          onClick={handleResetPassword}
          disabled={resetStatus === 'loading' || resetStatus === 'success'}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {resetStatus === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
          {resetStatus === 'success' && <CheckCircle className="w-4 h-4" />}
          {resetStatus === 'idle' || resetStatus === 'error' ? 'Send Reset Link' : resetStatus === 'success' ? 'Email Sent' : 'Processing...'}
        </button>
        {resetStatus === 'error' && <p className="text-red-500 text-sm mt-2">Failed to send reset link. Please try again.</p>}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 p-6">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Permanently delete your account and all associated data. This action is irreversible.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={deleteStatus === 'loading'}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {deleteStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Account
        </button>
        {deleteStatus === 'error' && <p className="text-red-500 text-sm mt-2">Failed to delete account. Please try again.</p>}
      </div>
    </div>
  );
}
