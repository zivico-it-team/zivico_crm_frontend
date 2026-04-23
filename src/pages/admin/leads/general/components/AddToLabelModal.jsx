// src/pages/admin/leads/general/components/AddToLabelModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddToLabelModal = ({ isOpen, onClose, lead, labelTabs, labelColors, onAddToLabel }) => {
  const [selectedLabel, setSelectedLabel] = useState('');

  if (!isOpen || !lead) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedLabel) {
      onAddToLabel(lead.id, selectedLabel);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add to Label</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 mb-4 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">Lead:</p>
          <p className="font-medium text-gray-900">{lead.name || 'Unnamed Lead'}</p>
          {lead.email && <p className="text-sm text-gray-500">{lead.email}</p>}
        </div>

        {labelTabs.length === 0 ? (
          <div className="p-4 text-center border border-yellow-200 rounded-lg bg-yellow-50">
            <p className="text-sm text-yellow-700">No labels created yet.</p>
            <p className="mt-1 text-xs text-yellow-600">
              Please create a label first using the "New" button.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="mb-2 text-sm font-medium text-gray-700">Select Label:</p>
            <div className="flex flex-col gap-2 mb-4 overflow-y-auto max-h-60">
              {labelTabs.map((label) => (
                <label
                  key={label}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                    selectedLabel === label ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="label"
                    value={label}
                    checked={selectedLabel === label}
                    onChange={(e) => setSelectedLabel(e.target.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: labelColors[label] || '#6B7280' }}
                  ></span>
                  <span className="text-gray-800">{label}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedLabel}
                className={`px-4 py-2 text-white rounded-lg ${
                  selectedLabel
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-blue-300 cursor-not-allowed'
                }`}
              >
                Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddToLabelModal;