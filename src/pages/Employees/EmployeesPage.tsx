import React from 'react';

// Components
import POSLayout from '../../components/Layout/POSLayout';
import Button from '../../components/Button';

const EmployeesPage: React.FC = () => {
  const employees = [
    { id: 1, name: 'Admin User', role: 'Administrator', email: 'admin@pos.com', status: 'Active' },
    { id: 2, name: 'John Doe', role: 'Cashier', email: 'john@pos.com', status: 'Active' },
    { id: 3, name: 'Jane Smith', role: 'Manager', email: 'jane@pos.com', status: 'On Break' },
  ];

  return (
    <POSLayout>
      <div className="flex flex-col space-y-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 font-poppins">Employees Management</h2>
          <div className="flex space-x-md">
            <Button variant="secondary">
              Import CSV
            </Button>
            <Button variant="primary">
              <svg className="w-5 h-5 mr-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Employee
            </Button>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-lg py-md">Name</th>
                <th className="px-lg py-md">Role</th>
                <th className="px-lg py-md">Email</th>
                <th className="px-lg py-md">Status</th>
                <th className="px-lg py-md text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-lg py-md font-bold">{emp.name}</td>
                  <td className="px-lg py-md">{emp.role}</td>
                  <td className="px-lg py-md">{emp.email}</td>
                  <td className="px-lg py-md">
                    <span className={`px-sm py-xs rounded-full text-xs font-bold ${emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-lg py-md text-right">
                    <div className="flex justify-end space-x-sm">
                      <Button variant="inverted" className="px-sm py-xs text-xs">Edit</Button>
                      <Button variant="danger" className="px-sm py-xs text-xs">Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </POSLayout>
  );
};

export default EmployeesPage;
