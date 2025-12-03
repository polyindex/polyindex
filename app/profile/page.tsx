'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ConfirmModal } from '@/components/ConfirmModal';

type Tab = 'myindexes' | 'settings';

interface UserIndex {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  category?: string;
  markets: string[];
  filters?: any;
  created_at: string;
  starCount?: number;
  marketCount?: number;
}

export default function ProfilePage() {
  const { profile, loading: authLoading, isAuthenticated, signOut } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('myindexes');
  const [deleting, setDeleting] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [indexes, setIndexes] = useState<UserIndex[]>([]);
  const [loadingIndexes, setLoadingIndexes] = useState(true);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'toggle' | 'delete' | null;
    indexId: string;
    indexName: string;
    currentIsPublic: boolean;
  }>({
    isOpen: false,
    type: null,
    indexId: '',
    indexName: '',
    currentIsPublic: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchIndexes();
    }
  }, [isAuthenticated, profile]);

  const fetchIndexes = async () => {
    try {
      const res = await fetch('/api/indexes/user', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setIndexes(data);
      }
    } catch (error) {
      console.error('Error fetching indexes:', error);
    } finally {
      setLoadingIndexes(false);
    }
  };

  const handleTogglePublic = (indexId: string, indexName: string, currentIsPublic: boolean) => {
    setConfirmModal({
      isOpen: true,
      type: 'toggle',
      indexId,
      indexName,
      currentIsPublic,
    });
  };

  const handleDeleteIndex = (indexId: string, indexName: string) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      indexId,
      indexName,
      currentIsPublic: false,
    });
  };

  const executeTogglePublic = async () => {
    try {
      const res = await fetch(`/api/indexes/${confirmModal.indexId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isPublic: !confirmModal.currentIsPublic,
        }),
      });

      if (res.ok) {
        // Update local state
        setIndexes(indexes.map(index =>
          index.id === confirmModal.indexId ? { ...index, is_public: !confirmModal.currentIsPublic } : index
        ));
      } else {
        alert('Failed to update index');
      }
    } catch (error) {
      console.error('Error updating index:', error);
      alert('Failed to update index');
    }
  };

  const executeDeleteIndex = async () => {
    try {
      const res = await fetch(`/api/indexes/${confirmModal.indexId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        // Remove from local state
        setIndexes(indexes.filter(index => index.id !== confirmModal.indexId));
      } else {
        alert('Failed to delete Index');
      }
    } catch (error) {
      console.error('Error deleting Index:', error);
      alert('Failed to delete Index');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      });

      if (res.ok) {
        await signOut();
        router.push('/');
      } else {
        alert('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setPasswordError(error.message);
      } else {
        setPasswordSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setPasswordError('Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };


  if (authLoading || !isAuthenticated || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <Navigation />

      <main className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-8">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {profile.username}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {profile.email}
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('myindexes')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'myindexes'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              My Indexes
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              Settings
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl p-8">
            {/* My Indexes Tab */}
            {activeTab === 'myindexes' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    My Indexes
                  </h1>
                </div>

                {loadingIndexes ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500"></div>
                  </div>
                ) : indexes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      You haven't created any indexes yet
                    </p>
                    <button
                      onClick={() => router.push('/create-index')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Create Your First Index
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {indexes.map((index) => (
                      <div
                        key={index.id}
                        className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {index.name}
                            </h3>
                            {index.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                {index.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                {index.marketCount || index.markets?.length || 0} markets
                              </span>
                              {index.is_public && index.starCount !== undefined && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4 fill-yellow-400" viewBox="0 0 24 24">
                                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                  {index.starCount} stars
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => router.push(`/create-index?edit=${index.id}`)}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Edit Index"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleTogglePublic(index.id, index.name, index.is_public)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                                index.is_public
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                              }`}
                              title={index.is_public ? 'Make Private' : 'Make Public'}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                {index.is_public ? (
                                  <>
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                  </>
                                ) : (
                                  <>
                                    <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                  </>
                                )}
                              </svg>
                              {index.is_public ? 'Public' : 'Private'}
                            </button>
                            <button
                              onClick={() => handleDeleteIndex(index.id, index.name)}
                              className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Delete Index"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                    Settings
                  </h1>
                </div>

                {/* Change Password */}
                <div className="pb-8 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Change Password
                  </h2>

                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                    {passwordError && (
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-300 text-sm">
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-300 text-sm">
                        {passwordSuccess}
                      </div>
                    )}

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Delete Account */}
                <div>
                  <h2 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Delete Account
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting Account...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.type === 'toggle' ? executeTogglePublic : executeDeleteIndex}
        title={confirmModal.type === 'toggle' ? 'Confirm Visibility Change' : 'Confirm Delete Index'}
        message={
          confirmModal.type === 'toggle'
            ? `Are you sure you want to make this index ${confirmModal.currentIsPublic ? 'private' : 'public'}? ${confirmModal.currentIsPublic ? 'It will no longer be visible to other users.' : 'It will become visible to all users.'}`
            : 'Are you sure you want to delete this index? This action cannot be undone.'
        }
        confirmText={confirmModal.type === 'toggle' ? 'Change Visibility' : 'Delete Index'}
        expectedInput={`${profile?.username}/${confirmModal.indexName.toLowerCase().replace(/\s+/g, '-')}`}
        actionType={confirmModal.type === 'toggle' ? 'warning' : 'danger'}
      />

      <Footer />
    </div>
  );
}
