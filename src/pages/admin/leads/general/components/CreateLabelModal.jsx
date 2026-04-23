// src/pages/admin/leads/general/components/CreateLabelModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Orange
  '#10B981', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#1F2937', // Dark Gray
];

const CreateLabelModal = ({ isOpen, onClose, onCreateLabel }) => {
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (labelName.trim()) {
      onCreateLabel({
        name: labelName.trim(),
        color: selectedColor,
      });
      setLabelName('');
      setSelectedColor(COLORS[0]);
      onClose();
    }
  };

  const handleClose = () => {
    setLabelName('');
    setSelectedColor(COLORS[0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Label</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Label Name
            </label>
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter label name"
              autoFocus
            />
            <p className="mt-1 text-sm text-right text-gray-500">
              {labelName.length}/20 characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    selectedColor === color 
                      ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' 
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 mb-4 border rounded-lg">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: selectedColor }}
            />
            <span className="text-sm text-gray-600">Preview: </span>
            <span 
              className="px-2 py-1 text-xs text-white rounded-full"
              style={{ backgroundColor: selectedColor }}
            >
              {labelName || 'Label Name'}
            </span>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!labelName.trim()}
              className={`px-4 py-2 text-white rounded-lg ${
                labelName.trim() 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Create Label
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateLabelModal;