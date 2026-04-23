import React from 'react';
import { buildAvatarUrl } from '@/lib/avatar';

const EmployeeNode = ({ employee, level = 0, userRole = 'employee', onEdit, onDelete }) => {
  const canEdit = ['admin', 'manager'].includes(userRole);
  const profileImage = buildAvatarUrl(employee) || employee.profileImage || "/default-avatar.png";
  
  return (
    <div className={`mb-3 ${level > 0 ? 'ml-8' : ''}`}>
      <div className="flex items-center p-4 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md">
        {/* Profile Image */}
        <div className="flex-shrink-0 mr-4">
          <img
            src={profileImage}
            alt={employee.name}
            className="object-cover w-12 h-12 border-2 border-gray-200 rounded-full"
          />
        </div>
        
        {/* Employee Details */}
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-800">{employee.name}</h3>
          <p className="text-sm text-gray-600">{employee.position}</p>
          <div className="flex items-center mt-1 space-x-2">
            <span className="px-2 py-1 text-xs text-blue-700 rounded bg-blue-50">
              {employee.department}
            </span>
            {employee.email && (
              <span className="text-xs text-gray-500">{employee.email}</span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        {canEdit && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(employee)}
              className="px-3 py-1 text-sm text-blue-600 rounded bg-blue-50 hover:bg-blue-100"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(employee.id)}
              className="px-3 py-1 text-sm text-red-600 rounded bg-red-50 hover:bg-red-100"
            >
              Remove
            </button>
          </div>
        )}
      </div>
      
      {/* Render Children */}
      {employee.children && employee.children.length > 0 && (
        <div className="pl-4 mt-3 ml-6 border-l-2 border-gray-200">
          {employee.children.map(child => (
            <EmployeeNode
              key={child.id}
              employee={child}
              level={level + 1}
              userRole={userRole}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeNode;
