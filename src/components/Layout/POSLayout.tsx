import React from 'react'

interface POSLayoutProps {
  children: React.ReactNode
  onLogout?: () => void
}

const POSLayout: React.FC<POSLayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-width-sidebar flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-height-header flex items-center px-lg border-b border-gray-200">
          <span className="text-xl font-bold text-primary">POS System</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-md space-y-sm">
          <div className="p-sm bg-primary-50 text-primary rounded-md font-medium cursor-pointer">Dashboard</div>
          <div className="p-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">Products</div>
          <div className="p-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">Orders</div>
          <div className="p-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer transition-colors">Settings</div>
        </nav>
        <div className="p-md border-t border-gray-200">
          <div
            onClick={onLogout}
            className="p-sm text-red-500 hover:bg-red-50 rounded-md cursor-pointer transition-colors flex items-center space-x-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </div>
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
