import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const MainLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="flex max-w-7xl mx-auto">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  </div>
);

export default MainLayout;
