import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Calendar, Download, FileText, Search, User } from 'lucide-react';

import MainLayout from '@/components/MainLayout';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api, { API_ORIGIN } from '@/lib/api';

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const SharedFilesView = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSharedFiles = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/files/shared-with-me');
        setFiles(Array.isArray(data?.files) ? data.files : []);
      } catch (error) {
        console.error('Error loading shared files:', error);
        setFiles([]);
        toast({
          title: 'Shared files load failed',
          description: error.response?.data?.message || 'Unable to load shared files from the database.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSharedFiles();
  }, [toast]);

  const filteredFiles = useMemo(
    () =>
      files.filter((file) =>
        file.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [files, searchTerm]
  );

  return (
    <>
      <Helmet>
        <title>Shared Files - HRMS</title>
      </Helmet>
      <MainLayout>
        <div className="space-y-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shared Files</h1>
              <p className="text-gray-500">Database files shared with you</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <Input
                placeholder="Search files..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center bg-white border border-gray-200 rounded-xl">
              <p className="text-sm text-gray-500">Loading shared files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-white border border-gray-300 border-dashed rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No shared files found</h3>
              <p>Only files stored and shared from the database will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredFiles.map((file) => (
                <div key={file.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-3 rounded-lg bg-blue-50">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{file.name}</h3>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <a
                      href={`${API_ORIGIN}${file.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-blue-600"
                      title="Open file"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>Shared by: {file.sharedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="px-2 py-1 text-gray-600 uppercase bg-gray-100 rounded">
                        {file.fileType || 'file'}
                      </span>
                      <span>{file.scope === 'team' ? 'Team Share' : 'Direct Share'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default SharedFilesView;
