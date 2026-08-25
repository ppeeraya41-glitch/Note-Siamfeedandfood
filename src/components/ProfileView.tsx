import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';

export const ProfileView: React.FC = () => {
  const { user, userProfile, signInWithGoogle, signInAsDemo, signOut, updateProfile, authError, clearAuthError } =
    useAuth();
  const { isSyncing, resetToDefaultData, exportDataAsCSV, exportDataAsJSON, transactions } =
    useTransactions();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(userProfile?.displayName || 'Peeraya P.');
  const [customEmail, setCustomEmail] = useState<string>(userProfile?.email || 'p.peeraya41@gmail.com');
  const [currency, setCurrency] = useState<string>(userProfile?.currency || '$');
  const [budget, setBudget] = useState<string>((userProfile?.monthlyBudget || 3000).toString());
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSavePreferences = async () => {
    await updateProfile({
      displayName: displayName.trim() || 'Peeraya P.',
      email: customEmail.trim() || 'p.peeraya41@gmail.com',
      currency,
      monthlyBudget: parseFloat(budget) || 3000,
    });
    setIsEditing(false);
    setStatusMsg('Preferences updated successfully!');
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div id="profile-view" className="flex flex-col gap-6 max-w-2xl mx-auto w-full pb-24 md:pb-12 animate-fadeIn">
      {/* User Header Profile Card */}
      <section className="bg-[#0d0d0f] rounded-2xl ambient-shadow-level-1 p-6 border border-zinc-800 relative overflow-hidden">
        {/* Ambient Gradient Decoration */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 ring-2 ring-amber-500/30 shrink-0 shadow-lg flex items-center justify-center">
            {userProfile?.photoURL ? (
              <img
                alt="User avatar"
                className="w-full h-full object-cover"
                src={userProfile.photoURL}
              />
            ) : (
              <span className="text-2xl font-serif text-amber-400 font-bold">FP</span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-serif text-xl md:text-2xl font-medium text-zinc-100">
                {userProfile?.displayName || 'Peeraya P.'}
              </h2>
              {user && !user.isAnonymous && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Google Verified
                </span>
              )}
            </div>

            <p className="font-mono text-xs text-zinc-500">
              {userProfile?.email || 'p.peeraya41@gmail.com'}
            </p>

            {/* Cloud Status */}
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px]">
                <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-spin' : 'bg-emerald-400'}`}></span>
                {isSyncing ? 'Syncing Firestore...' : 'Firebase PPeeraya-server Active'}
              </span>
              <span className="text-zinc-500 font-mono text-[11px]">
                {transactions.length} transactions saved
              </span>
            </div>
          </div>
        </div>

        {authError && (
          <div className="mt-4 p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl text-xs flex items-center justify-between">
            <span>{authError}</span>
            <button onClick={clearAuthError} className="font-bold ml-2">✕</button>
          </div>
        )}

        {statusMsg && (
          <div className="mt-4 p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        {/* Gmail Sign In / Sign Out Actions */}
        <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-wrap gap-3">
          {user && !user.isAnonymous ? (
            <button
              id="btn-sign-out"
              onClick={signOut}
              className="px-4 py-2.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-xl font-semibold text-xs hover:bg-rose-500/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign Out
            </button>
          ) : (
            <div className="flex flex-wrap gap-2 w-full">
              <button
                id="btn-google-signin"
                onClick={signInWithGoogle}
                className="flex-1 min-w-[200px] py-2.5 px-4 bg-zinc-900 border border-zinc-700 hover:border-amber-500/60 hover:bg-zinc-800 text-zinc-100 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google (Gmail)
              </button>

              <button
                id="btn-quick-signin"
                onClick={() => signInAsDemo('p.peeraya41@gmail.com')}
                className="py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold rounded-xl text-xs hover:brightness-110 active:scale-95 transition-all shadow-sm"
              >
                Connect as Peeraya
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Preferences & Settings */}
      <section className="bg-[#0d0d0f] rounded-2xl ambient-shadow-level-1 p-6 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-medium text-zinc-100">
            App Preferences
          </h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Gmail / Email</label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 outline-none focus:border-amber-500"
                >
                  <option value="$">$ (USD)</option>
                  <option value="฿">฿ (THB)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="¥">¥ (JPY)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">Monthly Budget Limit</label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-100 outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-black rounded-xl font-bold text-xs hover:brightness-110 transition-all shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80 text-xs font-inter">
            <div className="py-2.5 flex justify-between">
              <span className="text-zinc-500">Preferred Currency</span>
              <span className="font-mono text-zinc-200 font-semibold">{userProfile?.currency || '$'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-zinc-500">Monthly Budget Target</span>
              <span className="font-mono text-zinc-200 font-semibold">
                {userProfile?.currency || '$'}{(userProfile?.monthlyBudget || 3000).toLocaleString()}
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-zinc-500">Active Cloud Project</span>
              <span className="font-mono text-amber-400">PPeeraya-server (Firestore)</span>
            </div>
          </div>
        )}
      </section>

      {/* Data Management */}
      <section className="bg-[#0d0d0f] rounded-2xl ambient-shadow-level-1 p-6 border border-zinc-800 space-y-4">
        <h3 className="font-serif text-base font-medium text-zinc-100">
          Data & Storage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={exportDataAsCSV}
            className="p-3.5 bg-zinc-900/60 hover:bg-zinc-800/80 rounded-xl border border-zinc-800 hover:border-zinc-700 text-left flex items-center gap-3 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">table_view</span>
            </div>
            <div>
              <p className="font-inter text-xs font-semibold text-zinc-200">Export as CSV</p>
              <p className="text-[11px] font-mono text-zinc-500">Spreadsheet format</p>
            </div>
          </button>

          <button
            onClick={exportDataAsJSON}
            className="p-3.5 bg-zinc-900/60 hover:bg-zinc-800/80 rounded-xl border border-zinc-800 hover:border-zinc-700 text-left flex items-center gap-3 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">data_object</span>
            </div>
            <div>
              <p className="font-inter text-xs font-semibold text-zinc-200">Export as JSON</p>
              <p className="text-[11px] font-mono text-zinc-500">Full data backup</p>
            </div>
          </button>
        </div>

        <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
          <span className="text-xs text-zinc-500">Reset or re-seed sample data</span>
          <button
            onClick={async () => {
              if (confirm('Reset transactions to the original template data?')) {
                await resetToDefaultData();
                alert('Sample data restored!');
              }
            }}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
          >
            Restore Default Data
          </button>
        </div>
      </section>
    </div>
  );
};
