import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

interface POSLayoutProps {
  children: React.ReactNode
}

const POSLayout: React.FC<POSLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard', path: '/dashboard', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Products', path: '/products', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 11m8 4V5" />
        </svg>
      )
    },
    {
      name: 'Employees', path: '/employees', icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-poppins">
      {/* Sidebar */}
      <aside className="w-width-sidebar flex-shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="h-height-header flex items-center px-lg border-b border-gray-200">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white mr-sm shadow-lg shadow-primary-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 118 0m-4 8a2 2 0 110-4 2 2 0 010 4zm-8 8a2 2 0 110-4 2 2 0 010 4zm-4-8a2 2 0 110-4 2 2 0 010 4zm0 0V7a4 4 0 018 0v4m-8 8a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
          <span className="text-xl font-black text-gray-800 tracking-tight">POS<span className="text-primary">PRO</span></span>
        </div>

        <nav className="flex-1 overflow-y-auto p-md space-y-sm mt-md">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`p-sm rounded-xl font-bold flex items-center space-x-md transition-all ${location.pathname === item.path
                ? 'bg-primary text-white'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                }`}
            >
              <div className={location.pathname === item.path ? 'text-white' : 'text-gray-400'}>
                {item.icon}
              </div>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-md border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full p-sm text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all flex items-center space-x-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-height-header bg-white border-b border-gray-200 flex items-center justify-between px-lg flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">New Sale</h1>
          <div className="flex items-center space-x-md">
            <span className="text-sm text-gray-500">Cashier: Admin</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-lg">
          {children}
        </main>

        {/* Footer (Optional) */}
        <footer className="h-height-footer bg-white border-t border-gray-200 flex items-center px-lg text-sm text-gray-400 flex-shrink-0">
          &copy; 2026 POS System v1.0.0
        </footer>
      </div>
    </div>
  )
}

export default POSLayout
