import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  BellRing,
  Clock3,
  Eye,
  FileImage,
  FileText,
  RefreshCcw,
  Search,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react';

import MainLayout from '@/components/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import api, { API_ORIGIN } from '@/lib/api';
import { isAdminOrHRUser } from '@/lib/roleUtils';

const toAbsoluteFileUrl = (value = '') => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  if (/^https?:\/\//i.test(normalized)) return normalized;
  return `${API_ORIGIN}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
};

const formatFileSize = (bytes = 0) => {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (value) => {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleString();
};

const getDaysLeft = (expiresAt) => {
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) return 0;
  const msLeft = expiry - Date.now();
  return Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
};

const getFileIcon = (mimeType = '') => {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized.startsWith('image/')) {
    return FileImage;
  }
  return FileText;
};

const getFileMetaLabel = (mimeType = '') => {
  const normalized = String(mimeType || '').toLowerCase();
  if (normalized === 'application/pdf') {
    return 'PDF Document';
  }
  if (normalized.startsWith('image/')) {
    return 'Image File';
  }
  return 'Attached File';
};

const getDocumentTitle = (document = {}) => {
  const title = String(document.title || '').trim();
  const originalName = String(document.originalName || '').trim();

  if (!title) {
    return 'Important Document';
  }

  return title === originalName ? 'Important Document' : title;
};

const getImportantDocumentUploadErrorMessage = (error) => {
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) {
    return apiMessage;
  }

  if (error instanceof TypeError) {
    return 'Something went wrong while finishing the upload. Please refresh and try again.';
  }

  if (error?.response?.status === 413) {
    return 'The selected file is too large for the server to accept.';
  }

  if (error?.code === 'ERR_NETWORK' || !error?.response) {
    return 'Unable to reach the server. Please check that the backend is running and try again.';
  }

  return 'Unable to upload the important document.';
};

const ImportantDocumentsView = ({
  pageTitle = 'Important Documents - HRMS',
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const canUpload = isAdminOrHRUser(currentUser);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    note: '',
    file: null,
  });

  const loadDocuments = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data } = await api.get('/important-documents', { timeout: 10000 });
      setDocuments(Array.isArray(data?.documents) ? data.documents : []);
    } catch (error) {
      console.error('Error loading important documents:', error);
      setDocuments([]);
      toast({
        title: 'Important documents load failed',
        description: error.response?.data?.message || 'Unable to load important documents.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return documents;
    }

    return documents.filter((document) =>
      [document.title, document.note, document.originalName, document.uploadedByName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [documents, searchTerm]);

  const stats = useMemo(
    () => ({
      total: documents.length,
      unread: documents.filter((document) => !document.isRead).length,
      expiringSoon: documents.filter((document) => getDaysLeft(document.expiresAt) <= 2).length,
    }),
    [documents]
  );

  const handleFieldChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!canUpload) return;
    const formElement = event.currentTarget;

    if (!formData.file) {
      toast({
        title: 'File required',
        description: 'Please choose a PDF or image before uploading.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const payload = new FormData();
      payload.append('file', formData.file);
      payload.append('title', formData.title);
      payload.append('note', formData.note);

      const { data } = await api.post('/important-documents', payload);

      const createdDocument = data?.document || null;
      if (createdDocument?.id) {
        setDocuments((previous) => [
          createdDocument,
          ...previous.filter((document) => document.id !== createdDocument.id),
        ]);
      }

      setFormData({
        title: '',
        note: '',
        file: null,
      });
      formElement?.reset();

      toast({
        title: 'Important document uploaded',
        description: 'Managers and employees will now receive a notification for this document.',
      });

      loadDocuments(true);
    } catch (error) {
      console.error('Error uploading important document:', error);
      toast({
        title: 'Upload failed',
        description: getImportantDocumentUploadErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const markDocumentAsReadLocally = (documentId) => {
    setDocuments((previous) =>
      previous.map((document) =>
        document.id === documentId ? { ...document, isRead: true } : document
      )
    );
  };

  const handleOpenDocument = async (document) => {
    const fileUrl = toAbsoluteFileUrl(document.url);
    if (fileUrl) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }

    if (document.isRead) {
      return;
    }

    try {
      await api.patch(`/important-documents/${document.id}/read`);
      markDocumentAsReadLocally(document.id);
    } catch (error) {
      console.error('Error marking important document as read:', error);
      toast({
        title: 'Read status update failed',
        description: error.response?.data?.message || 'Unable to update read status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
      </Helmet>

      <MainLayout>
        <div className="mx-auto max-w-screen-2xl space-y-6 px-2 pb-6 pt-1 sm:px-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 shadow-sm">
            <div className="absolute -left-8 top-0 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="absolute -right-8 bottom-0 h-24 w-24 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold text-white">Important Documents</h1>
                <p className="mt-1 text-sm text-slate-200">
                  HR and admin can publish urgent files with or without a note. Managers and employees can view them for 7 days.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                className="h-9 border border-white/20 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
                onClick={() => loadDocuments(true)}
                disabled={refreshing}
              >
                <RefreshCcw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total Documents</p>
                  <p className="mt-1 text-3xl font-semibold text-slate-900">{stats.total}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <FileText className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Unread</p>
                  <p className="mt-1 text-3xl font-semibold text-blue-600">{stats.unread}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <BellRing className="h-5 w-5" />
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Expiring Soon</p>
                  <p className="mt-1 text-3xl font-semibold text-amber-600">{stats.expiringSoon}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 className="h-5 w-5" />
                </span>
              </div>
            </div>
          </div>

          {canUpload ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <UploadCloud className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Publish Important Document</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Upload a PDF or image. Adding an important note is optional, and managers and employees will receive a notification.
                  </p>
                </div>
              </div>

              <form className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr_220px_auto]" onSubmit={handleUpload}>
                <Input
                  value={formData.title}
                  onChange={(event) => handleFieldChange('title', event.target.value)}
                  placeholder="Document title (optional)"
                />
                <textarea
                  value={formData.note}
                  onChange={(event) => handleFieldChange('note', event.target.value)}
                  placeholder="Important note (optional)"
                  rows={3}
                  className="min-h-[46px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(event) => handleFieldChange('file', event.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                <Button type="submit" className="h-11" disabled={uploading}>
                  <UploadCloud className={`mr-2 h-4 w-4 ${uploading ? 'animate-pulse' : ''}`} />
                  {uploading ? 'Uploading...' : 'Publish'}
                </Button>
              </form>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">View Only Access</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    HR and admin publish these documents. You can open and read them here, but only HR/admin can upload new files.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search documents or notes..."
                  className="pl-9"
                />
              </div>
              <p className="text-sm text-slate-500">
                Showing {filteredDocuments.length} of {documents.length} documents
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-12 text-center text-sm text-slate-500 shadow-sm">
              Loading important documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="rounded-2xl border border-slate-300 border-dashed bg-white px-4 py-12 text-center text-slate-500 shadow-sm">
              No important documents found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredDocuments.map((document) => {
                const FileIcon = getFileIcon(document.mimeType);
                const daysLeft = getDaysLeft(document.expiresAt);
                const isUnread = !document.isRead;

                return (
                  <article
                    key={document.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      isUnread
                        ? 'border-blue-200 bg-blue-50 shadow-sm dark:border-blue-500/40 dark:bg-blue-500/10'
                        : 'border-slate-200 bg-slate-100/80 opacity-90 dark:border-slate-700 dark:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 gap-3">
                        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                          <FileIcon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className={`truncate text-base ${isUnread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-100'}`}>
                              {getDocumentTitle(document)}
                            </h3>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                isUnread
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {isUnread ? 'New' : 'Viewed'}
                            </span>
                          </div>
                          {document.note ? (
                            <p className={`mt-2 text-sm leading-6 ${isUnread ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                              {document.note}
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant={isUnread ? 'default' : 'outline'}
                        onClick={() => handleOpenDocument(document)}
                        className="shrink-0"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Open File
                      </Button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-500 sm:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-slate-400">Uploaded By</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{document.uploadedByName}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-slate-400">Posted</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDateTime(document.createdAt)}</p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-slate-400">Expires</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                          {formatDateTime(document.expiresAt)} ({daysLeft} day{daysLeft === 1 ? '' : 's'} left)
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase tracking-wide text-slate-400">File</p>
                        <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                          {getFileMetaLabel(document.mimeType)} - {formatFileSize(document.size)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default ImportantDocumentsView;
