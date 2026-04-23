import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Download, Trash2, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const DocumentsSection = ({ documents, onUpdate }) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const safeDocuments = Array.isArray(documents) ? documents : [];

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        type: file.type
      };
      
      onUpdate([...safeDocuments, newDoc]);
      setUploading(false);
      toast({ title: "Document Uploaded", description: `${file.name} added successfully.` });
    }, 1500);
  };

  const handleDelete = (id) => {
    onUpdate(safeDocuments.filter(d => d.id !== id));
    toast({ title: "Document Deleted", description: "File removed successfully." });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <div className="relative">
          <input
            type="file"
            id="doc-upload"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.png"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label htmlFor="doc-upload">
            <Button variant="outline" size="sm" className="cursor-pointer" asChild disabled={uploading}>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Document'}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {safeDocuments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            No documents uploaded yet.
          </div>
        ) : (
          safeDocuments.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.size} • Uploaded on {doc.uploadDate}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                  <Download className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 hover:text-red-600"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default DocumentsSection;
