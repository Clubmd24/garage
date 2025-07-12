import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export function Layout({ children }) {
  return (
    <div className="bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] min-h-screen flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header />
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
