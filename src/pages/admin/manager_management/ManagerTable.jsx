import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, Edit, Trash2, Mail, Phone, User, Briefcase, Shield, Users } from 'lucide-react';

const ManagerTable = ({ managers, onView, onEdit, onDelete, searchTerm }) => {
  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
        <User className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">No managers found</h3>
      <p className="max-w-sm text-sm text-gray-500">
        {searchTerm 
          ? `No results match "${searchTerm}". Try adjusting your search terms.`
          : 'Get started by adding your first manager to the system.'}
      </p>
    </div>
  );

  if (managers.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      {/* Desktop Table View */}
      <div className="hidden overflow-x-auto border border-gray-200 rounded-lg shadow-sm lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Manager
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Department / Role
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {managers.map((manager) => (
              <tr key={manager.id} className="transition-colors duration-150 hover:bg-gray-50">
                {/* Manager Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={manager.avatar} alt={manager.name || 'Manager'} className="object-cover" />
                        <AvatarFallback className="text-lg font-medium text-white bg-gradient-to-br from-purple-500 to-indigo-600">
                          {(manager.name || 'M').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {manager.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {manager.designation || 'Manager'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate max-w-[150px]">{manager.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Phone className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span>{manager.phone || 'N/A'}</span>
                  </div>
                </td>

                {/* Department & Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{manager.department || 'N/A'}</div>
                  <div className="flex items-center mt-1">
                    <Shield className={`w-3 h-3 mr-1 ${
                      manager.role === 'admin' ? 'text-purple-600' : 'text-green-600'
                    }`} />
                    <span className={`text-xs font-medium ${
                      manager.role === 'admin' ? 'text-purple-600' : 'text-green-600'
                    }`}>
                      {manager.role === 'admin' ? 'Admin' : 'Manager'}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    manager.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {manager.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onView(manager)} 
                      className="p-1 rounded-full hover:bg-blue-50"
                      title="View Profile"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onEdit(manager)} 
                      className="p-1 rounded-full hover:bg-gray-50"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(manager)} 
                      className="p-1 rounded-full hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {managers.map((manager) => (
          <div
            key={manager.id}
            className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
          >
            {/* Header with Avatar and Basic Info */}
            <div className="p-4">
              <div className="flex items-start mb-3 space-x-3">
                <div className="flex-shrink-0">
                  <Avatar className="w-12 h-12 shadow-sm">
                    <AvatarImage src={manager.avatar} alt={manager.name || 'Manager'} className="object-cover" />
                    <AvatarFallback className="text-lg font-semibold text-white bg-gradient-to-br from-purple-500 to-indigo-600">
                      {(manager.name || 'M').charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {manager.name || 'Unknown'}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {manager.designation || 'Manager'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      manager.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {manager.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                      manager.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {manager.role === 'admin' ? 'Admin' : 'Manager'}
                    </span>
                    {manager.department && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {manager.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details Grid */}
              <div className="grid grid-cols-1 gap-2 p-3 mb-3 rounded-lg sm:grid-cols-2 bg-gray-50">
                {manager.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{manager.email}</span>
                  </div>
                )}
                {manager.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span>{manager.phone}</span>
                  </div>
                )}
                {manager.employeeId && (
                  <div className="flex items-center text-sm text-gray-600 sm:col-span-2">
                    <Briefcase className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-mono text-xs">ID: {manager.employeeId}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(manager)}
                  className="inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-blue-600 rounded-md bg-blue-50 hover:bg-blue-100"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(manager)}
                  className="inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-gray-600 rounded-md bg-gray-50 hover:bg-gray-100"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(manager)}
                  className="inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-red-600 rounded-md bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagerTable;
