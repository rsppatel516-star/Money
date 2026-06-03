/* eslint-disable */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { isFirebaseConfigured, firebaseConfig } from '../services/firebase';
import { BiUser, BiBell, BiGlobe, BiChip, BiCheck, BiRefresh } from 'react-icons/bi';

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Oliver', 'Milo', 'Luna', 'Cleo', 'Toby'];

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { settings, updateSettings } = useFinance();

  // Profile Form States
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.photoURL || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Preference Form States
  const [currency, setCurrency] = useState(settings?.currency || 'INR');
  const [notifications, setNotifications] = useState(settings?.notifications ?? true);
  const [weeklySummary, setWeeklySummary] = useState(settings?.weeklySummary ?? true);
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Firebase Setup Form States
  const [fbApiKey, setFbApiKey] = useState(localStorage.getItem('moneyflow_user_fb_apiKey') || '');
  const [fbProjectId, setFbProjectId] = useState(localStorage.getItem('moneyflow_user_fb_projectId') || '');
  const [fbAppId, setFbAppId] = useState(localStorage.getItem('moneyflow_user_fb_appId') || '');
  const [fbSuccess, setFbSuccess] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileLoading(true);

    try {
      await updateProfile(displayName, selectedAvatar);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePreferencesSave = async (e) => {
    e.preventDefault();
    setPrefSuccess(false);
    await updateSettings({
      currency,
      notifications,
      weeklySummary
    });
    setPrefSuccess(true);
    setTimeout(() => setPrefSuccess(false), 3000);
  };

  const handleFirebaseSave = (e) => {
    e.preventDefault();
    setFbSuccess(false);

    if (fbApiKey && fbProjectId) {
      localStorage.setItem('moneyflow_user_fb_apiKey', fbApiKey);
      localStorage.setItem('moneyflow_user_fb_projectId', fbProjectId);
      if (fbAppId) localStorage.setItem('moneyflow_user_fb_appId', fbAppId);
      
      setFbSuccess(true);
      setTimeout(() => {
        setFbSuccess(false);
        // Reload to let Firebase app re-initialize with user configs
        window.location.reload();
      }, 1500);
    } else {
      localStorage.removeItem('moneyflow_user_fb_apiKey');
      localStorage.removeItem('moneyflow_user_fb_projectId');
      localStorage.removeItem('moneyflow_user_fb_appId');
      setFbSuccess(true);
      setTimeout(() => {
        setFbSuccess(false);
        window.location.reload();
      }, 1000);
    }
  };

  const isUsingRealFirebase = isFirebaseConfigured || (localStorage.getItem('moneyflow_user_fb_apiKey') && localStorage.getItem('moneyflow_user_fb_projectId'));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-heading tracking-tight leading-none">
          Settings & Configurations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Configure currency limits, notification switches, and synchronize with your Firebase backend.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Profile Card & Preset Avatars */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Form */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
              <BiUser className="text-brand-500 text-lg" /> Profile Details
            </h3>

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1.5">
                <BiCheck /> Profile details updated successfully!
              </div>
            )}
            {profileError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              {/* Avatar Preset Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Avatar Preset</label>
                <div className="flex flex-wrap gap-2.5">
                  {AVATAR_SEEDS.map((seed) => {
                    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                    const isSelected = selectedAvatar === avatarUrl;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatar(avatarUrl)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all relative ${
                          isSelected 
                            ? 'border-brand-500 scale-105 ring-2 ring-brand-500/20' 
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                        }`}
                      >
                        <img src={avatarUrl} alt={seed} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                            <BiCheck className="text-white text-lg font-bold bg-brand-500 rounded-full p-0.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 focus:outline-none focus:border-brand-500 text-sm"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 bg-slate-100/30 dark:bg-slate-900/10 text-slate-450 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors shadow-lg shadow-brand-500/10"
                >
                  {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Preferences Settings Form */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
              <BiGlobe className="text-brand-500 text-lg" /> Preferences & Limits
            </h3>

            {prefSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1.5">
                <BiCheck /> Preferences saved successfully!
              </div>
            )}

            <form onSubmit={handlePreferencesSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Currency Selection */}
                <div className="space-y-1 sm:col-span-1">
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Currency Selection</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:border-brand-500 text-sm"
                  >
                    <option value="INR" className="text-slate-800 dark:bg-slate-900">₹ Indian Rupee (INR)</option>
                    <option value="USD" className="text-slate-800 dark:bg-slate-900">$ US Dollar (USD)</option>
                    <option value="EUR" className="text-slate-800 dark:bg-slate-900">€ Euro (EUR)</option>
                  </select>
                </div>

                {/* Notifications switch */}
                <div className="flex flex-col justify-end space-y-2 sm:col-span-2 py-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                    Enable Budget Warnings and Overrun Alerts
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={weeklySummary}
                      onChange={(e) => setWeeklySummary(e.target.checked)}
                      className="w-4 h-4 text-brand-500 rounded border-slate-300 focus:ring-brand-500 cursor-pointer"
                    />
                    Receive Weekly AI Spending Analysis Summary
                  </label>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold transition-colors shadow-lg shadow-brand-500/10"
                >
                  Save Preferences
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Firebase connection */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark border border-slate-200/50 dark:border-slate-800/50 flex flex-col gap-4 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-heading flex items-center gap-2">
              <BiChip className="text-brand-500 text-lg" /> Synchronization Engine
            </h3>

            {/* Sync State Badge */}
            <div className={`p-4 rounded-2xl flex flex-col gap-1 text-xs border ${
              isUsingRealFirebase 
                ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-450' 
                : 'bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-450'
            }`}>
              <span className="font-bold flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isUsingRealFirebase ? 'bg-emerald-500' : 'bg-amber-500'} inline-block animate-pulse`} />
                {isUsingRealFirebase ? 'Cloud Database Mode' : 'Local Storage Mode'}
              </span>
              <p className="text-[10px] text-slate-500 leading-normal mt-1">
                {isUsingRealFirebase 
                  ? 'Your inputs are automatically synced in real-time with Google Cloud Firestore.' 
                  : 'Your inputs are persisted securely on this device only. You can enter Firebase secrets below to unlock remote sync.'
                }
              </p>
            </div>

            {fbSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold flex items-center gap-1">
                <BiRefresh className="text-lg animate-spin" /> Reloading and configuring sync...
              </div>
            )}

            {/* Config Form */}
            <form onSubmit={handleFirebaseSave} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Firebase API Key</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={fbApiKey}
                  onChange={(e) => setFbApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 focus:outline-none focus:border-brand-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Project ID</label>
                <input
                  type="text"
                  placeholder="moneyflow-abcd"
                  value={fbProjectId}
                  onChange={(e) => setFbProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 focus:outline-none focus:border-brand-500 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">App ID (Optional)</label>
                <input
                  type="text"
                  placeholder="1:12345:web:abcd"
                  value={fbAppId}
                  onChange={(e) => setFbAppId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-transparent text-slate-800 dark:text-slate-150 focus:outline-none focus:border-brand-500 text-xs font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl border border-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold text-xs hover:bg-brand-500/10 hover:border-brand-500 transition-all text-center flex items-center justify-center gap-1.5"
              >
                {fbApiKey ? 'Save Credentials & Sync' : 'Clear Config & Switch Local'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
