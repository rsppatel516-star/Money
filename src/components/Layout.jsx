/* eslint-disable */
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import AddTransactionModal from './AddTransactionModal';
import { BiPlus } from 'react-icons/bi';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 mesh-bg-light dark:mesh-bg-dark transition-colors duration-300">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {/* Navbar */}
        <Navbar />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Navigation - Mobile Only */}
      <MobileNav />

      {/* Floating Action Button (FAB) for Quick Transaction creation */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed right-6 bottom-20 md:bottom-8 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-violet-500 hover:from-brand-500 hover:to-violet-400 text-white flex items-center justify-center shadow-xl shadow-brand-500/30 cursor-pointer border border-brand-400/20"
        title="Add Transaction"
      >
        <BiPlus className="text-3xl" />
      </motion.button>

      {/* Quick Transaction Creation Modal */}
      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
