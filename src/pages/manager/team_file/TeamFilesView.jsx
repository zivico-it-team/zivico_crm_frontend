import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Download, FileText, Search, Share2, Upload, Users } from 'lucide-react';

import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import api, { API_ORIGIN } from '@/lib/api';

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const TeamFilesView = () => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [people, setPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [shareToTeam, setShareToTeam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const loadFiles = useCallback(async (query = '') => {
    try {
      setLoading(true);
      const { data } = await api.get('/team-files', {
        params: {
          search: query || undefined,
          limit: 100,
        },
      });
      setFiles(Array.isArray(data?.files) ? data.files : []);
    } catch (error) {
      console.error('Error loading team files:', error);
      setFiles([]);
      toast({
        title: 'Files load failed',
        description: error.response?.data?.message || 'Unable to load team files from the database.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadPeople = useCallback(async () => {
    try {
      const { data } = await api.get('/team-files/people');
      setPeople(Array.isArray(data?.users) ? data.users : []);
    } catch (error) {
      console.error('Error loading people list:', error);
      setPeople([]);
    }
  }, []);

  useEffect(() => {
    loadFiles();
    loadPeople();
  }, [loadFiles, loadPeople]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadFiles(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [loadFiles, searchTerm]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Upload complete',
        description: 'File saved to the database.',
      });
      await loadFiles(searchTerm);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Upload failed',
        description: error.response?.data?.message || 'Unable to upload file.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleShareSave = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setSharing(true);
      await api.post('/team-files/share', {
        fileId: selectedFile._id,
        shareToTeam,
        userIds: shareToTeam ? [] : selectedPeople,
      });

      toast({
        title: 'File shared',
        description: 'Share settings were saved to the database.',
      });
      setSelectedFile(null);
      setSelectedPeople([]);
      setShareToTeam(false);
      await loadFiles(searchTerm);
    } catch (error) {
      console.error('Error sharing file:', error);
      toast({
        title: 'Share failed',
        description: error.response?.data?.message || 'Unable to save share settings.',
        variant: 'destructive',
      });
    } finally {
      setSharing(false);
    }
  };

  const stats = useMemo(
    () => ({
      total: files.length,
      shared: files.filter((file) => file.isShared).length,
      storage: formatFileSize(files.reduce((sum, file) => sum + (file.size || 0), 0)),
    }),
    [files]
  );

  return (
    <>
      <Helmet>
        <title>Team Files - HRMS</title>
      </Helmet>
      <MainLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="px-3 py-4 mx-auto max-w-7xl sm:px-4 md:px-6 lg:px-8">
            <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Team Files</h1>
                <p className="text-sm text-gray-500">Database files only</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute w-4 h-4 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Search files..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <label className="inline-flex">
                  <input type="file" className="hidden" onChange={handleUpload} />
                  <Button asChild disabled={uploading}>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
              <div className="p-4 bg-white border rounded-xl">
                <p className="text-xs text-gray-500">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-4 bg-white border rounded-xl">
                <p className="text-xs text-gray-500">Shared Files</p>
                <p className="text-2xl font-bold text-blue-600">{stats.shared}</p>
              </div>
              <div className="p-4 bg-white border rounded-xl">
                <p className="text-xs text-gray-500">Storage</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.storage}</p>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-sm text-center bg-white border rounded-xl text-gray-500">
                Loading files...
              </div>
            ) : files.length === 0 ? (
              <div className="py-12 text-center bg-white border rounded-xl">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-500">No files found in the database.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {files.map((file) => (
                  <div key={file._id} className="p-4 bg-white border rounded-xl">
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
                      <div className="flex gap-1">
                        <a
                          href={`${API_ORIGIN}${file.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-blue-600"
                          title="Open file"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setSelectedPeople([]);
                            setShareToTeam(false);
                          }}
                          className="inline-flex items-center justify-center w-9 h-9 text-gray-500 transition-colors rounded-lg hover:bg-gray-100 hover:text-emerald-600"
                          title="Share file"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      <span>{file.isShared ? 'Shared' : 'Not shared'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Share File</DialogTitle>
              </DialogHeader>
              {selectedFile && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-gray-50">
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  </div>

                  <label className="flex items-center gap-2 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={shareToTeam}
                      onChange={(event) => {
                        setShareToTeam(event.target.checked);
                        if (event.target.checked) {
                          setSelectedPeople([]);
                        }
                      }}
                    />
                    <span className="text-sm font-medium">Share with entire team</span>
                  </label>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4" />
                      Select people
                    </div>
                    <div className={`space-y-2 max-h-56 overflow-y-auto ${shareToTeam ? 'opacity-50 pointer-events-none' : ''}`}>
                      {people.map((person) => (
                        <label key={person._id} className="flex items-center gap-3 p-3 border rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedPeople.includes(person._id)}
                            onChange={() =>
                              setSelectedPeople((current) =>
                                current.includes(person._id)
                                  ? current.filter((id) => id !== person._id)
                                  : [...current, person._id]
                              )
                            }
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{person.name}</p>
                            <p className="text-xs text-gray-500">{person.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleShareSave}
                  disabled={sharing || (!shareToTeam && selectedPeople.length === 0)}
                >
                  {sharing ? 'Saving...' : 'Save Share'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </MainLayout>
    </>
  );
};

export default TeamFilesView;
