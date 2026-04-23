import React, { useState } from 'react';
import { Download, Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

import api from '@/lib/api';
import { useLeads } from '@/contexts/LeadsContext';

const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const getCellValue = (row, keys) => {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
};

const parseLeadsFromFile = async (file) => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames?.[0];

  if (!firstSheetName) {
    return [];
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });

  return rows.map((rawRow, index) => {
    const normalizedRow = Object.entries(rawRow || {}).reduce((acc, [key, value]) => {
      acc[normalizeHeader(key)] = String(value ?? '').trim();
      return acc;
    }, {});

    return {
      rowNumber: index + 2,
      email: getCellValue(normalizedRow, ['email', 'emailaddress', 'e-mail', 'mail']),
      name: getCellValue(normalizedRow, ['name', 'fullname', 'customername', 'leadname']),
      phone: getCellValue(normalizedRow, ['phone', 'phonenumber', 'mobile', 'contact', 'contactnumber', 'telephone']),
      campaign: getCellValue(normalizedRow, ['campaign', 'campaignname']),
      comment: getCellValue(normalizedRow, ['comment', 'comments', 'remark', 'remarks', 'note', 'notes']),
    };
  });
};

const UploadLeads = () => {
  const navigate = useNavigate();
  const { refreshLeads } = useLeads();
  const [activeTab, setActiveTab] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    campaign: '',
    comment: '',
  });

  const campaigns = ['Campaign A', 'Campaign B', 'Campaign C'];
  const tabs = ['New Leads', 'Existing Leads', 'Incomplete Leads'];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setLeadForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setLeadForm({
      name: '',
      email: '',
      phoneNumber: '',
      campaign: '',
      comment: '',
    });
  };

  const importParsedLeadRows = async (parsedRows = []) => {
    if (parsedRows.length === 0) {
      return {
        error: true,
        message: 'No rows found in the uploaded file.',
      };
    }

    const { data } = await api.post('/leads/upload', {
      rows: parsedRows,
    });

    const summary = data?.summary || {};
    const incompleteRows = Array.isArray(data?.data?.incomplete) ? data.data.incomplete : [];

    return {
      success: true,
      total: summary.totalRows || parsedRows.length,
      added: summary.newLeads || 0,
      existing: summary.existingLeads || 0,
      incomplete: summary.incompleteLeads || 0,
      errors: incompleteRows
        .slice(0, 5)
        .map((item) => `Row ${item?.rowNumber || '-'}: ${item?.reason || 'Incomplete row'}`),
    };
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setUploadSummary(null);

    try {
      const parsedRows = await parseLeadsFromFile(file);
      const summary = await importParsedLeadRows(parsedRows);
      setUploadSummary(summary);
      await refreshLeads();
    } catch (error) {
      console.error('Error uploading leads file:', error);
      setUploadSummary({
        error: true,
        message:
          error?.response?.data?.message
          || error?.message
          || 'Failed to upload Excel file.',
      });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      await api.post('/leads', {
        name: leadForm.name,
        email: leadForm.email,
        phone: leadForm.phoneNumber,
        phoneNumber: leadForm.phoneNumber,
        campaign: leadForm.campaign || 'Manual Entry',
        comment: leadForm.comment || 'Created manually',
        source: 'manual_entry',
      });

      setOpenCreateDialog(false);
      resetForm();
      setUploadSummary({
        success: true,
        total: 1,
        added: 1,
        existing: 0,
        incomplete: 0,
        errors: [],
      });
      await refreshLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
      setUploadSummary({
        error: true,
        message: error?.response?.data?.message || 'Failed to create lead.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      ['EMAIL', 'NAME', 'PHONE', 'CAMPAIGN (OPTIONAL)', 'COMMENT (OPTIONAL)'],
      ['john.doe@example.com', 'John Doe', '1234567890', 'Summer Campaign', 'Interested in product'],
      ['jane.smith@example.com', 'Jane Smith', '0987654321', 'Winter Campaign', 'Call back later'],
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    ws['!cols'] = [
      { wch: 25 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Leads Template');
    XLSX.writeFile(wb, 'leads_upload_template.xlsx');
  };

  const tabCounts = [
    uploadSummary?.success ? uploadSummary.added || 0 : 0,
    uploadSummary?.success ? uploadSummary.existing || 0 : 0,
    uploadSummary?.success ? uploadSummary.incomplete || 0 : 0,
  ];

  const TabPanel = () => (
    <div className="p-4 sm:p-6">
      <h3 className="mb-4 text-base font-medium sm:text-lg">{tabs[activeTab]}</h3>
      <div className="flex flex-col items-center justify-center px-4 py-8 border-2 border-gray-300 border-dashed sm:py-12 rounded-xl bg-gray-50">
        <div className="flex items-center justify-center w-12 h-12 mb-3 bg-gray-200 rounded-full sm:w-16 sm:h-16">
          <FileText className="w-6 h-6 text-gray-500 sm:w-8 sm:h-8" />
        </div>
        <p className="mb-4 text-sm text-center text-gray-500 sm:text-base">
          {activeTab === 0
            ? 'Upload Excel file to add new leads.'
            : activeTab === 1
              ? 'Already existing leads in the sheet will be counted here.'
              : 'Rows with missing required fields will be counted here.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setOpenUploadDialog(true)}
            className="px-4 py-2 text-xs text-white bg-blue-600 rounded-lg sm:text-sm hover:bg-blue-700"
          >
            Upload Now
          </button>
          <button
            onClick={() => navigate('/leads/assign')}
            className="px-4 py-2 text-xs border rounded-lg sm:text-sm hover:bg-gray-100"
          >
            Go to Assign Page
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-gray-50 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-start justify-between gap-4 mb-6 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Upload Leads</h1>
            <p className="text-sm text-gray-600">Upload Excel files to save leads directly into the database</p>
          </div>

          <div className="flex flex-wrap w-full gap-2 sm:w-auto">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center justify-center flex-1 gap-2 px-3 py-2 text-xs bg-white border rounded-lg sm:px-4 sm:text-sm hover:bg-gray-50 sm:flex-initial"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Download Template</span>
            </button>
            <button
              onClick={() => {
                setUploadSummary(null);
                setOpenCreateDialog(true);
              }}
              className="flex-1 px-3 py-2 text-xs text-white bg-blue-600 rounded-lg sm:px-4 sm:text-sm hover:bg-blue-700 sm:flex-initial"
            >
              Create Lead
            </button>
            <button
              onClick={() => {
                setUploadSummary(null);
                setOpenUploadDialog(true);
              }}
              className="flex-1 px-3 py-2 text-xs text-white bg-green-600 rounded-lg sm:px-4 sm:text-sm hover:bg-green-700 sm:flex-initial"
            >
              Upload Excel
            </button>
          </div>
        </div>

        <div className="p-4 mb-6 text-blue-800 border border-blue-200 rounded-lg bg-blue-50">
          <p className="text-sm">
            <strong>Note:</strong> For Excel upload, only <strong>Email</strong>, <strong>Name</strong>, and <strong>Phone</strong> are required. <strong>Campaign</strong> and <strong>Comment</strong> can be left empty. Uploaded leads will automatically appear in the{' '}
            <button
              onClick={() => navigate('/leads/general')}
              className="font-medium text-blue-600 underline hover:text-blue-800"
            >
              General Leads
            </button>{' '}
            and{' '}
            <button
              onClick={() => navigate('/leads/assign')}
              className="font-medium text-blue-600 underline hover:text-blue-800"
            >
              Assign Leads
            </button>{' '}
            pages after the upload is processed.
          </p>
        </div>

        <div className="overflow-hidden bg-white border rounded-lg">
          <div className="flex flex-wrap border-b">
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === idx
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab}</span>
                <span className="px-1.5 sm:px-2 py-0.5 ml-1 sm:ml-2 text-xs rounded-full bg-gray-200">
                  {tabCounts[idx]}
                </span>
              </button>
            ))}
          </div>
          <TabPanel />
        </div>

        {openCreateDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={() => !submitting && setOpenCreateDialog(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b sm:px-6">
                  <h2 className="text-lg font-semibold">Create New Lead</h2>
                  <button
                    onClick={() => !submitting && setOpenCreateDialog(false)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreateLead}>
                  <div className="overflow-y-auto px-4 sm:px-6 py-4 max-h-[calc(90vh-120px)]">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block mb-1 text-sm font-medium">Name *</label>
                          <input
                            type="text"
                            name="name"
                            value={leadForm.name}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="Enter full name"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">Email *</label>
                          <input
                            type="email"
                            name="email"
                            value={leadForm.email}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">Phone *</label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={leadForm.phoneNumber}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium">Campaign</label>
                          <select
                            name="campaign"
                            value={leadForm.campaign}
                            onChange={handleFormChange}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="">Select Campaign</option>
                            {campaigns.map((campaign) => (
                              <option key={campaign} value={campaign}>
                                {campaign}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block mb-1 text-sm font-medium">Comment</label>
                          <textarea
                            name="comment"
                            value={leadForm.comment}
                            onChange={handleFormChange}
                            rows="3"
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Additional notes about this lead"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 px-4 py-3 border-t bg-gray-50 sm:px-6">
                    <button
                      type="button"
                      onClick={() => !submitting && setOpenCreateDialog(false)}
                      className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Create Lead'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {openUploadDialog && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/50" onClick={() => !uploading && setOpenUploadDialog(false)} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white rounded-xl">
                <div className="flex items-center justify-between px-4 py-3 border-b sm:px-6">
                  <h2 className="text-lg font-semibold">Upload Excel File</h2>
                  {!uploading && (
                    <button onClick={() => setOpenUploadDialog(false)} className="p-1 rounded hover:bg-gray-100">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="p-6">
                  {uploading ? (
                    <div className="py-4 text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                        <Upload className="w-6 h-6 text-blue-600 animate-bounce" />
                      </div>
                      <p className="text-sm text-gray-600">Uploading and processing file...</p>
                    </div>
                  ) : uploadSummary ? (
                    <div className="text-center">
                      {uploadSummary.error ? (
                        <>
                          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          </div>
                          <p className="mb-2 text-red-600">{uploadSummary.message}</p>
                          <button
                            onClick={() => setUploadSummary(null)}
                            className="px-4 py-2 mt-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            Try Again
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="mb-2 text-lg font-semibold text-green-600">Success</p>
                          <p className="text-sm text-gray-600">
                            Added {uploadSummary.added} of {uploadSummary.total} rows to the database
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Existing: {uploadSummary.existing} | Incomplete: {uploadSummary.incomplete}
                          </p>
                          {uploadSummary.errors?.length > 0 && (
                            <div className="p-3 mt-4 text-left rounded-lg bg-yellow-50">
                              <p className="text-xs font-medium text-yellow-800">Incomplete rows:</p>
                              {uploadSummary.errors.map((err, index) => (
                                <p key={`${err}-${index}`} className="text-xs text-yellow-600">
                                  {err}
                                </p>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => {
                                setOpenUploadDialog(false);
                                setUploadSummary(null);
                              }}
                              className="flex-1 px-4 py-2 text-sm border rounded-lg hover:bg-gray-100"
                            >
                              Close
                            </button>
                            <button
                              onClick={() => {
                                setOpenUploadDialog(false);
                                setUploadSummary(null);
                                navigate('/leads/general');
                              }}
                              className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              View Leads
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <p className="mb-1 text-sm font-medium">Upload your leads file</p>
                      <p className="mb-4 text-xs text-gray-500">Supported: .xlsx, .xls, .csv</p>

                      <label className="inline-block px-4 py-2 text-sm text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700">
                        Choose File
                        <input
                          type="file"
                          hidden
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                      </label>

                      <div className="p-3 mt-4 text-left rounded-lg bg-gray-50">
                        <p className="text-xs font-medium text-gray-700">Required columns:</p>
                        <ul className="mt-1 text-xs text-gray-600 list-disc list-inside">
                          <li>Email</li>
                          <li>Name</li>
                          <li>Phone</li>
                          <li>Campaign</li>
                          <li>Comment</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadLeads;
