// src/pages/admin/leads/general/components/LabelTabMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const LabelTabMenu = ({ 
  tabName, 
  tabColor, 
  onEdit, 
  onDelete,
  isOpen,
  onClose 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(tabName);
  const [editedColor, setEditedColor] = useState(tabColor);
  const menuRef = useRef(null);

  const colors = [
    '#EF4444', // Red
    '#F59E0B', // Orange
    '#10B981', // Green
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#1F2937'  // Dark Gray
  ];

  // Update local state when props change
  useEffect(() => {
    setEditedName(tabName);
    setEditedColor(tabColor);
  }, [tabName, tabColor]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleEditClick = () => {
    setIsEditing(true);
    setShowDeleteConfirm(false);
  };

  const handleDeleteClick = () => {
    if (!onDelete) return;
    setShowDeleteConfirm(true);
    setIsEditing(false);
  };

  const handleSaveEdit = () => {
    if (editedName.trim()) {
      console.log('Saving edit:', { 
        oldName: tabName, 
        newName: editedName.trim(), 
        newColor: editedColor 
      });
      onEdit(tabName, { name: editedName.trim(), color: editedColor });
    }
    setIsEditing(false);
    onClose();
  };

  const handleConfirmDelete = () => {
    console.log('Deleting label:', tabName);
    if (onDelete) {
      onDelete(tabName);
    }
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowDeleteConfirm(false);
    setEditedName(tabName);
    setEditedColor(tabColor);
    onClose();
  };

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 z-50 w-64 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {showDeleteConfirm ? (
        /* Delete Confirmation View */
        <div className="p-4">
          <p className="mb-3 text-sm text-gray-700">
            Delete "{tabName}" label?
          </p>
          <p className="mb-4 text-xs text-gray-500">
            Leads with this label will be moved to "New Lead".
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-1 text-xs text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1 text-xs text-white bg-red-600 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      ) : isEditing ? (
        /* Edit View */
        <div className="p-4">
          <div className="mb-3">
            <label className="block mb-1 text-xs text-gray-600">Label Name</label>
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              maxLength={20}
              className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="mb-3">
            <label className="block mb-1 text-xs text-gray-600">Select Color</label>
            <div className="flex flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    console.log('Color selected:', color);
                    setEditedColor(color);
                  }}
                  className={`w-6 h-6 rounded-full transition-all ${
                    editedColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="p-2 mb-3 rounded-lg bg-gray-50">
            <p className="mb-1 text-xs text-gray-600">Preview:</p>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: editedColor }} />
              <span className="text-sm font-medium text-gray-700">{editedName}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1 text-xs text-gray-600 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={!editedName.trim()}
              className={`px-3 py-1 text-xs text-white rounded ${
                editedName.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Main Menu View */
        <>
          <div className="p-3 border-b">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tabColor }} />
              <span className="text-sm font-medium text-gray-700">{tabName}</span>
            </div>
          </div>
          
          <div className="p-2">
            <button
              onClick={handleEditClick}
              className="flex items-center w-full gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100"
            >
              <Edit2 className="w-4 h-4" />
              Edit Label
            </button>
            
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="flex items-center w-full gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Label
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default LabelTabMenu;
