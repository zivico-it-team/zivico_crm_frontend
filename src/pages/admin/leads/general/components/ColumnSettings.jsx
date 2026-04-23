// src/pages/admin/leads/general/components/ColumnSettings.jsx
import React from 'react';
import { Settings, X } from 'lucide-react';

const ColumnSettings = ({ 
  showColumnSettings, 
  setShowColumnSettings, 
  selectedColumns, 
  setSelectedColumns 
}) => {
  
  const availableColumns = [
    { id: 'email', label: 'Email' },
    { id: 'name', label: 'Name' },
    { id: 'phone', label: 'Phone' },
    { id: 'country', label: 'Country' },
    { id: 'language', label: 'Language' },
    { id: 'assignedTo', label: 'Assigned To' },
    { id: 'leadPool', label: 'Lead Pool' },
    { id: 'followUp', label: 'Follow Up' },
    { id: 'stage', label: 'Stage' },
    { id: 'tag', label: 'Tag' },
    { id: 'comment', label: 'Last Comment' },
    { id: 'assignedDate', label: 'Assigned Date' }
  ];

  const toggleColumn = (columnId) => {
    if (selectedColumns.includes(columnId)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnId));
    } else {
      setSelectedColumns([...selectedColumns, columnId]);
    }
  };

  const selectAll = () => {
    setSelectedColumns(availableColumns.map(col => col.id));
  };

  const deselectAll = () => {
    setSelectedColumns([]);
  };

  return (
    <>
      <button 
        onClick={() => setShowColumnSettings(true)}
        className="flex items-center gap-1 px-4 py-2 border rounded-lg"
      >
        <Settings className="w-4 h-4" /> Columns
      </button>

      {showColumnSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Column Settings</h2>
              <button 
                onClick={() => setShowColumnSettings(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between mb-4">
                <button 
                  onClick={selectAll}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Select All
                </button>
                <button 
                  onClick={deselectAll}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Deselect All
                </button>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-96">
                {availableColumns.map(column => (
                  <label key={column.id} className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedColumns.includes(column.id)}
                      onChange={() => toggleColumn(column.id)}
                      className="w-4 h-4 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{column.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t">
              <button
                onClick={() => setShowColumnSettings(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowColumnSettings(false)}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ColumnSettings;
