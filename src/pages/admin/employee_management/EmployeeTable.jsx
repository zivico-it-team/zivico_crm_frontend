import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2, Mail, Phone, User, Briefcase, Shield } from 'lucide-react';

const EmployeeAvatar = ({ person, sizeClass = 'w-10 h-10', textClass = 'text-lg' }) => {
  const [imageFailed, setImageFailed] = React.useState(false);
  const imageUrl = person?.avatar || person?.profilePicture || person?.profileImageUrl || '';
  const initial = (person?.name || 'U').charAt(0).toUpperCase();
  const isManager = person?.recordType === 'manager';

  return (
    <div
      className={`relative flex items-center justify-center rounded-full ${
        isManager ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'
      } ${sizeClass}`}
    >
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={person?.name || 'User'}
          className="object-cover w-full h-full rounded-full"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={`font-medium text-white ${textClass}`}>{initial}</span>
      )}
    </div>
  );
};

const getRoleLabel = (person) => {
  if (person?.recordType === 'manager') {
    return person?.role === 'admin' ? 'Admin' : 'Manager';
  }
  return 'Employee';
};

const getRoleBadgeClass = (person) => {
  if (person?.recordType === 'manager') {
    return person?.role === 'admin'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-indigo-100 text-indigo-800';
  }
  return 'bg-blue-100 text-blue-800';
};

const EmployeeTable = ({ employees, onView, onEdit, onDelete, searchTerm }) => {
  const people = Array.isArray(employees) ? employees : [];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex items-center justify-center w-20 h-20 mb-4 bg-gray-100 rounded-full">
        <User className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">No records found</h3>
      <p className="max-w-sm text-sm text-gray-500">
        {searchTerm
          ? `No results match "${searchTerm}". Try adjusting your search terms.`
          : 'Get started by adding your first employee or manager to the system.'}
      </p>
    </div>
  );

  if (people.length === 0) {
    return <EmptyState />;
  }

  return (
    <div>
      <div className="hidden overflow-x-auto border border-gray-200 rounded-lg shadow-sm lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Employee / Manager
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Department / ID
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {people.map((person) => (
              <tr key={person.id} className="transition-colors duration-150 hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <EmployeeAvatar person={person} sizeClass="w-10 h-10" textClass="text-lg" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {person.name || 'Unknown'}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-500">
                          {person.designation || person.professional?.designation || 'No designation'}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeClass(person)}`}>
                          {getRoleLabel(person)}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate max-w-[150px]">{person.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <Phone className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span>{person.phone || 'N/A'}</span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{person.department || person.professional?.department || 'N/A'}</div>
                  <div className="text-xs text-gray-500">ID: {person.employeeId || person.professional?.employeeId || 'N/A'}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      person.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {person.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(person)}
                      className="p-1 rounded-full hover:bg-blue-50"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(person)}
                      className="p-1 rounded-full hover:bg-gray-50"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(person)}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:hidden">
        {people.map((person) => (
          <div
            key={person.id}
            className="overflow-hidden transition-shadow duration-200 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
          >
            <div className="p-4">
              <div className="flex items-start mb-3 space-x-3">
                <div className="flex-shrink-0">
                  <EmployeeAvatar person={person} sizeClass="w-12 h-12 shadow-sm" textClass="text-lg font-semibold" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{person.name || 'Unknown'}</h3>
                  <p className="text-sm text-gray-500 truncate">{person.designation || 'No designation'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        person.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {person.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getRoleBadgeClass(person)}`}>
                      {person.recordType === 'manager' && <Shield className="w-3 h-3 mr-1" />}
                      {getRoleLabel(person)}
                    </span>
                    {person.department && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {person.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 p-3 mb-3 rounded-lg sm:grid-cols-2 bg-gray-50">
                {person.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{person.email}</span>
                  </div>
                )}
                {person.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span>{person.phone}</span>
                  </div>
                )}
                {person.employeeId && (
                  <div className="flex items-center text-sm text-gray-600 sm:col-span-2">
                    <Briefcase className="flex-shrink-0 w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-mono text-xs">ID: {person.employeeId}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(person)}
                  className="inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-blue-600 rounded-md bg-blue-50 hover:bg-blue-100"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(person)}
                  className="inline-flex items-center justify-center px-2 py-2 text-xs font-medium text-gray-600 rounded-md bg-gray-50 hover:bg-gray-100"
                >
                  <Edit className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(person)}
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

export default EmployeeTable;
