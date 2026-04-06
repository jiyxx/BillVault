"use client";

import { useState } from 'react';
import AppShell from '../../components/AppShell';
import { User, Bell, Shield, KeyRound, Smartphone } from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');

  // We are keeping this mostly presentational for now as the core requirements 
  // focus on tracking, OCR, trips, and parsing.
  
  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 p-4">
          <nav className="space-y-1">
            {[
              { id: 'profile', label: 'Profile Settings', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'integrations', label: 'Integrations', icon: Smartphone },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'api', label: 'API Keys', icon: KeyRound },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8">
          {activeTab === 'profile' && (
            <div className="max-w-xl animate-in fade-in">
              <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Profile Details</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    disabled 
                    value="+1 (555) 123-4567" 
                    className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Shield className="w-3 h-3 mr-1" /> This phone number is verified via Firebase Auth
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Currency</label>
                  <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-primary-500">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="animate-in fade-in">
              <h2 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">External Integrations</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xl">
                Connect external accounts to forward receipts automatically for NLP processing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#25D366]/10 text-[#25D366] rounded-lg flex items-center justify-center">
                      <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">WhatsApp Bot</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Send messages directly to log expenses</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    Connect
                  </button>
                </div>

                <div className="border border-slate-200 dark:border-slate-700 p-5 rounded-xl flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg flex items-center justify-center">
                      <DeviceMobile className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">SMS Parsing</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Auto-read SMS bank triggers</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-1.5 rounded-lg cursor-not-allowed">
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['notifications', 'security', 'api'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 animate-in fade-in">
              <Settings className="w-12 h-12 mb-3 opacity-20" />
              <p>Configuration panel for {activeTab} coming soon.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

// Dummy icon for SMS integration placeholder above
function DeviceMobile(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
      <path d="M12 18h.01" />
    </svg>
  );
}
