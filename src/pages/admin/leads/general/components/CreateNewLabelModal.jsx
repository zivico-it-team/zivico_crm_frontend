// src/pages/admin/leads/general/components/CreateNewLabelModal.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateNewLabelModal = ({ open, onClose, onCreate }) => {
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6');

  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (labelName.trim()) {
      onCreate({
        name: labelName.trim(),
        color: selectedColor,
        id: Date.now().toString() // Simple ID generation
      });
      setLabelName('');
      setSelectedColor('#3B82F6');
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Create New Label</h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 rounded-full hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
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
            <p className="mt-1 text-xs text-gray-500">
              {labelName.length}/20 characters
            </p>
          </div>

          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-600 scale-110' : 'border-transparent'
                  } transition-all`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!labelName.trim()}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Label
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNewLabelModal;