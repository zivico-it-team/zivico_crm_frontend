import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  Filter,
  Grid,
  RefreshCw,
  Archive,
  Bookmark,
  Calendar,
  Settings,
  X,
  Check,
  Mail,
  Phone,
  User,
  Edit,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLeads } from "@/contexts/LeadsContext";
import { useAuth } from "@/contexts/AuthContext";

// ----------------------------------------------------------------------
// ColumnSettings Component
// ----------------------------------------------------------------------
const ColumnSettings = ({
  showColumnSettings,
  setShowColumnSettings,
  selectedColumns,
  setSelectedColumns,
}) => {
  const [tempSelectedColumns, setTempSelectedColumns] =
    useState(selectedColumns);

  const columnOptions = [
    { id: "email", label: "EMAIL", required: true },
    { id: "name", label: "NAME", required: true },
    { id: "phone", label: "PHONE NO", required: true },
    { id: "assignedTo", label: "ASSIGNED TO" },
    { id: "leadPool", label: "LEAD POOL" },
    { id: "followUp", label: "FOLLOW-UP AT" },
    { id: "stage", label: "LEAD STAGE", required: true },
    { id: "tag", label: "TAG", required: true },
    { id: "Complaints", label: "COMPLIANCE TYPE" },
    { id: "comment", label: "LAST COMMENT" },
    { id: "assignedDate", label: "ASSIGNED DATE" },
  ];

  const handleApply = () => {
    const requiredColumns = columnOptions
      .filter((col) => col.required)
      .map((col) => col.id);
    const finalColumns = [
      ...new Set([...tempSelectedColumns, ...requiredColumns]),
    ];
    setSelectedColumns(finalColumns);
    setShowColumnSettings(false);
  };

  const handleReset = () => {
    const defaultColumns = columnOptions.map((col) => col.id);
    setTempSelectedColumns(defaultColumns);
  };

  const handleSelectAll = () => {
    setTempSelectedColumns(columnOptions.map((col) => col.id));
  };

  const handleSelectNone = () => {
    const requiredColumns = columnOptions
      .filter((col) => col.required)
      .map((col) => col.id);
    setTempSelectedColumns(requiredColumns);
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setTempSelectedColumns(selectedColumns);
          setShowColumnSettings(!showColumnSettings);
        }}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Settings className="w-4 h-4" />
        Columns
      </button>

      {showColumnSettings && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setShowColumnSettings(false)}
          />
          <div className="absolute right-0 z-50 p-4 mt-2 -translate-x-1/2 bg-white border shadow-xl w-72 rounded-xl left-1/2 sm:left-auto sm:right-0 sm:translate-x-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Customize Columns
              </h3>
              <button
                onClick={() => setShowColumnSettings(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={handleSelectAll}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors bg-blue-50 rounded-lg hover:bg-blue-100"
                >
                  Select All
                </button>
                <button
                  onClick={handleSelectNone}
                  className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  Select None
                </button>
              </div>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-64">
              {columnOptions.map((column) => (
                <label
                  key={column.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                    tempSelectedColumns.includes(column.id)
                      ? "bg-blue-50 border border-blue-100"
                      : "hover:bg-gray-50"
                  } ${column.required ? "opacity-70" : ""}`}
                >
                  <div className="flex items-center min-w-0">
                    {column.required && (
                      <span className="w-1 h-4 mr-2 bg-blue-500 rounded-full"></span>
                    )}
                    <span
                      className={`text-sm truncate ${column.required ? "font-medium text-gray-900" : "text-gray-700"}`}
                    >
                      {column.label}
                    </span>
                  </div>
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      checked={tempSelectedColumns.includes(column.id)}
                      onChange={(e) => {
                        if (column.required) return;
                        if (e.target.checked) {
                          setTempSelectedColumns([
                            ...tempSelectedColumns,
                            column.id,
                          ]);
                        } else {
                          setTempSelectedColumns(
                            tempSelectedColumns.filter((c) => c !== column.id),
                          );
                        }
                      }}
                      disabled={column.required}
                      className="sr-only"
                    />
                    <div
                      className={`w-5 h-5 border rounded flex items-center justify-center ${
                        tempSelectedColumns.includes(column.id)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300"
                      } ${column.required ? "opacity-50" : ""}`}
                    >
                      {tempSelectedColumns.includes(column.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-4 mt-4 border-t">
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Reset
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 px-3 py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
              <p className="mt-2 text-xs text-center text-gray-400">
                {tempSelectedColumns.length} of {columnOptions.length} selected
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ----------------------------------------------------------------------
// LeadTable Subcomponents
// ----------------------------------------------------------------------
const LeadStageBadge = ({ stage }) => {
  const stageConfig = {
    Registered: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: "✓",
    },
    "Ongoing Followup": {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-200",
      icon: "⏰",
    },
    "Sale Interested But Follow Up Later": {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: "⏰",
    },
    "Sales Not Interested": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: "✗",
    },
    Converted: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: "✓",
    },
  };

  const config = stageConfig[stage] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
    icon: "•",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="mr-1">{config.icon}</span>
      <span className="max-w-[120px] truncate">{stage}</span>
    </span>
  );
};

const TagBadge = ({ tag }) => {
  const tagConfig = {
    "No Answer": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
    },
    "Not Interested": {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
    },
    "Other Language": {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    Interested: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
    },
  };

  const config = tagConfig[tag] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {tag}
    </span>
  );
};

// Fixed Column Widths
const COLUMN_WIDTHS = {
  actions: "w-[100px]",
  email: "w-[220px]",
  name: "w-[160px]",
  phone: "w-[130px]",
  assignedTo: "w-[200px]",
  leadPool: "w-[170px]",
  followUp: "w-[150px]",
  stage: "w-[180px]",
  tag: "w-[130px]",
  Complaints: "w-[140px]",
  comment: "w-[220px]",
  assignedDate: "w-[160px]",
};

// ----------------------------------------------------------------------
// LeadTable Component
// ----------------------------------------------------------------------
const LeadTable = ({
  leads,
  selectedColumns,
  toggleBookmark,
  toggleArchive,
  currentPage,
  itemsPerPage,
}) => {
  const navigate = useNavigate();

  if (leads.length === 0) return null;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

  // Desktop Table View
  const DesktopTableView = () => {
    return (
      <div className="w-full overflow-x-auto" style={{ maxWidth: "100%" }}>
        <table className="w-full border-collapse table-fixed">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {/* Actions Column */}
              <th
                className={`${COLUMN_WIDTHS.actions} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
              >
                ACTIONS
              </th>

              {/* Email Column */}
              {selectedColumns.includes("email") && (
                <th
                  className={`${COLUMN_WIDTHS.email} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-500" />
                    EMAIL
                  </div>
                </th>
              )}

              {/* Name Column */}
              {selectedColumns.includes("name") && (
                <th
                  className={`${COLUMN_WIDTHS.name} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    NAME
                  </div>
                </th>
              )}

              {/* Phone Column */}
              {selectedColumns.includes("phone") && (
                <th
                  className={`${COLUMN_WIDTHS.phone} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-500" />
                    PHONE
                  </div>
                </th>
              )}

              {/* Assigned To Column */}
              {selectedColumns.includes("assignedTo") && (
                <th
                  className={`${COLUMN_WIDTHS.assignedTo} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  ASSIGNED TO
                </th>
              )}

              {/* Lead Pool Column */}
              {selectedColumns.includes("leadPool") && (
                <th
                  className={`${COLUMN_WIDTHS.leadPool} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  LEAD POOL
                </th>
              )}

              {/* Follow-up Column */}
              {selectedColumns.includes("followUp") && (
                <th
                  className={`${COLUMN_WIDTHS.followUp} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    FOLLOW-UP
                  </div>
                </th>
              )}

              {/* Stage Column */}
              {selectedColumns.includes("stage") && (
                <th
                  className={`${COLUMN_WIDTHS.stage} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  STAGE
                </th>
              )}

              {/* Tag Column */}
              {selectedColumns.includes("tag") && (
                <th
                  className={`${COLUMN_WIDTHS.tag} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  TAG
                </th>
              )}

              {/* Compliance Column */}
              {selectedColumns.includes("Complaints") && (
                <th
                  className={`${COLUMN_WIDTHS.Complaints} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  Compliance
                </th>
              )}

              {/* Comment Column */}
              {selectedColumns.includes("comment") && (
                <th
                  className={`${COLUMN_WIDTHS.comment} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  LAST COMMENT
                </th>
              )}

              {/* Date Column */}
              {selectedColumns.includes("assignedDate") && (
                <th
                  className={`${COLUMN_WIDTHS.assignedDate} px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    DATE
                  </div>
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {currentLeads.map((lead) => (
              <tr
                key={lead.id}
                className="transition-colors hover:bg-gray-50/80"
              >
                {/* Actions Column */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit Lead"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleBookmark(lead.id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        lead.isBookmarked
                          ? "text-yellow-600 hover:bg-yellow-50"
                          : "text-gray-500 hover:text-yellow-600 hover:bg-yellow-50"
                      }`}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${lead.isBookmarked ? "fill-current" : ""}`}
                      />
                    </button>
                    <button
                      onClick={() => toggleArchive(lead.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </td>

                {/* Email Column */}
                {selectedColumns.includes("email") && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50">
                        <Mail className="w-4 h-4 text-blue-600" />
                      </div>
                      <button
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="text-sm text-blue-600 truncate hover:underline"
                        title={lead.email}
                      >
                        {lead.email}
                      </button>
                    </div>
                  </td>
                )}

                {/* Name Column */}
                {selectedColumns.includes("name") && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <button
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="text-sm font-medium text-blue-600 truncate hover:underline"
                        title={lead.name}
                      >
                        {lead.name}
                      </button>
                    </div>
                  </td>
                )}

                {/* Phone Column */}
                {selectedColumns.includes("phone") && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-green-50">
                        <Phone className="w-4 h-4 text-green-600" />
                      </div>
                      <button
                        onClick={() => navigate(`/leads/${lead.id}`)}
                        className="text-sm text-blue-600 truncate hover:underline"
                        title={lead.phone}
                      >
                        {lead.phone}
                      </button>
                    </div>
                  </td>
                )}

                {/* Assigned To Column */}
                {selectedColumns.includes("assignedTo") && (
                  <td className="px-4 py-3">
                    <span
                      className="block text-sm text-gray-900 truncate"
                      title={lead.assignedTo}
                    >
                      {lead.assignedTo === "N/A"
                        ? "Unassigned"
                        : lead.assignedTo}
                    </span>
                  </td>
                )}

                {/* Lead Pool Column */}
                {selectedColumns.includes("leadPool") && (
                  <td className="px-4 py-3">
                    <span
                      className="block text-sm text-gray-900 truncate"
                      title={lead.leadPool}
                    >
                      {lead.leadPool || "-"}
                    </span>
                  </td>
                )}

                {/* Follow-up Column */}
                {selectedColumns.includes("followUp") && (
                  <td className="px-4 py-3">
                    {lead.followUp === "N/A" ? (
                      <span className="text-sm text-gray-400">—</span>
                    ) : (
                      <span
                        className="block text-sm text-gray-900 truncate"
                        title={lead.followUp}
                      >
                        {lead.followUp}
                      </span>
                    )}
                  </td>
                )}

                {/* Stage Column */}
                {selectedColumns.includes("stage") && (
                  <td className="px-4 py-3">
                    <LeadStageBadge stage={lead.stage} />
                  </td>
                )}

                {/* Tag Column */}
                {selectedColumns.includes("tag") && (
                  <td className="px-4 py-3">
                    <TagBadge tag={lead.tag} />
                  </td>
                )}

                {/* Compliance Column */}
                {selectedColumns.includes("Complaints") && (
                  <td className="px-4 py-3">
                    <LeadStageBadge stage={lead.ComplaintsType} />
                  </td>
                )}

                {/* Comment Column */}
                {selectedColumns.includes("comment") && (
                  <td className="px-4 py-3">
                    <p
                      className="text-sm text-gray-600 truncate"
                      title={lead.comment}
                    >
                      {lead.comment}
                    </p>
                  </td>
                )}

                {/* Date Column */}
                {selectedColumns.includes("assignedDate") && (
                  <td className="px-4 py-3">
                    {lead.assignedDate ? (
                      <span
                        className="block text-sm text-gray-900 truncate"
                        title={lead.assignedDate}
                      >
                        {lead.assignedDate}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Mobile Card View
  const MobileLeadCard = ({ lead }) => (
    <div className="p-4 mb-3 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center flex-1 min-w-0 gap-3">
          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
            {lead.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="block text-sm font-semibold text-left text-blue-600 truncate hover:underline"
            >
              {lead.name}
            </button>
            <button
              onClick={() => navigate(`/leads/${lead.id}`)}
              className="flex items-center gap-1 mt-0.5 text-xs text-left text-blue-600 truncate hover:underline"
            >
              <Mail className="flex-shrink-0 w-3 h-3" />
              <span className="truncate">{lead.email}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0 gap-1">
          <button
            onClick={() => toggleBookmark(lead.id)}
            className={`p-2 rounded-lg ${
              lead.isBookmarked
                ? "text-yellow-600 bg-yellow-50"
                : "text-gray-400 hover:text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${lead.isBookmarked ? "fill-current" : ""}`}
            />
          </button>
          <button
            onClick={() => toggleArchive(lead.id)}
            className="p-2 text-gray-400 rounded-lg hover:text-red-600 hover:bg-red-50"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="p-2 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs text-gray-500">Phone</p>
          <button
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="text-sm font-medium text-left text-blue-600 truncate hover:underline"
          >
            {lead.phone}
          </button>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs text-gray-500">Assigned To</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {lead.assignedTo === "N/A" ? "Unassigned" : lead.assignedTo}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs text-gray-500">Stage</p>
          <LeadStageBadge stage={lead.stage} />
        </div>
        <div className="p-2 rounded-lg bg-gray-50">
          <p className="mb-1 text-xs text-gray-500">Tag</p>
          <TagBadge tag={lead.tag} />
        </div>
      </div>

      {lead.comment && (
        <div className="p-2 mt-3 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 line-clamp-2">{lead.comment}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span className="truncate max-w-[150px]">
            {lead.assignedDate || "Not assigned"}
          </span>
        </div>
        <span className="text-xs text-gray-400">ID: {lead.id}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile View */}
      <div className="block sm:hidden">
        {currentLeads.map((lead) => (
          <MobileLeadCard key={lead.id} lead={lead} />
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block">
        <DesktopTableView />
      </div>
    </>
  );
};

// ----------------------------------------------------------------------
// Pagination Component
// ----------------------------------------------------------------------
const Pagination = ({
  currentPage,
  totalPages,
  totalLeads,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
}) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalLeads);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-600">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span> • Showing{" "}
          <span className="font-medium">{startIndex + 1}</span> to{" "}
          <span className="font-medium">{endIndex}</span> of{" "}
          <span className="font-medium">{totalLeads}</span> results
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-sm">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Tabs Component (provided but not used in GeneralLeads)
// ----------------------------------------------------------------------
const Tabs = ({ activeTab, setActiveTab, tabs, setCurrentPage }) => {
  const tabIcons = {
    All: <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    Fresh: <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    Archived: <Archive className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    Bookmarked: <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
    "Show Follow Ups": <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />,
  };

  return (
    <div className="flex flex-wrap gap-1 sm:gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => {
            setActiveTab(tab.id);
            setCurrentPage(1);
          }}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-blue-100 text-blue-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {tabIcons[tab.id]}
          <span className="hidden xs:inline">{tab.label}</span>
          <span
            className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full ${
              activeTab === tab.id
                ? "bg-blue-200 text-blue-800"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

// ----------------------------------------------------------------------
// Main GeneralLeads Component
// ----------------------------------------------------------------------
const GeneralLeads = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { leads, toggleBookmark, toggleArchive } = useLeads();

  const normalize = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();
  const currentUserId = String(currentUser?._id || currentUser?.id || "");
  const currentUserKeys = new Set(
    [
      currentUserId,
      normalize(currentUser?.name),
      normalize(currentUser?.email),
      normalize(currentUser?.userName),
    ].filter(Boolean),
  );

  const employeeOwnedLeads = leads.filter((lead) => {
    const assignedId = String(lead?.assignedToId || "");
    const assignedName = normalize(lead?.assignedTo);

    return currentUserKeys.has(assignedId) || currentUserKeys.has(assignedName);
  });

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([
    "email",
    "name",
    "phone",
    "assignedTo",
    "leadPool",
    "followUp",
    "stage",
    "tag",
    "Complaints",
    "comment",
    "assignedDate",
  ]);

  // Tab counts
  const tabs = [
    {
      id: "All",
      label: "All",
      count: employeeOwnedLeads.length,
      icon: <Grid className="w-4 h-4" />,
    },
    {
      id: "Fresh",
      label: "Fresh",
      count: employeeOwnedLeads.filter((l) => l.status === "fresh").length,
      icon: <RefreshCw className="w-4 h-4" />,
    },
    {
      id: "Archived",
      label: "Archived",
      count: employeeOwnedLeads.filter((l) => l.isArchived).length,
      icon: <Archive className="w-4 h-4" />,
    },
    {
      id: "Bookmarked",
      label: "Bookmarked",
      count: employeeOwnedLeads.filter((l) => l.isBookmarked).length,
      icon: <Bookmark className="w-4 h-4" />,
    },
    {
      id: "Show Follow Ups",
      label: "Follow Ups",
      count: employeeOwnedLeads.filter((l) => l.followUp !== "N/A").length,
      icon: <Calendar className="w-4 h-4" />,
    },
  ];

  // Filter leads
  const filteredLeads = employeeOwnedLeads.filter((lead) => {
    if (activeTab === "Fresh" && lead.status !== "fresh") return false;
    if (activeTab === "Archived" && !lead.isArchived) return false;
    if (activeTab === "Bookmarked" && !lead.isBookmarked) return false;
    if (activeTab === "Show Follow Ups" && lead.followUp === "N/A")
      return false;

    const matchesSearch =
      searchTerm === "" ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      String(lead.assignedTo || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalLeads = filteredLeads.length;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl py-6 mx-auto sm:px-10 lg:px-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leads Info</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and review all leads
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 pb-1 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-blue-200 text-blue-800"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:w-96">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2.5 pr-4 text-sm border border-gray-300 rounded-lg pl-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>

            <button
              onClick={() => navigate("/leads/add")}
              className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Lead
            </button>

            <ColumnSettings
              showColumnSettings={showColumnSettings}
              setShowColumnSettings={setShowColumnSettings}
              selectedColumns={selectedColumns}
              setSelectedColumns={setSelectedColumns}
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <div className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 rounded-full bg-blue-50">
            <Filter className="w-4 h-4 mr-1.5" />
            <span>
              {filteredLeads.length} leads found
              {activeTab !== "All" && ` in ${activeTab}`}
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="w-full">
            <LeadTable
              leads={filteredLeads}
              selectedColumns={selectedColumns}
              toggleBookmark={toggleBookmark}
              toggleArchive={toggleArchive}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />
          </div>
        </div>

        {/* Pagination */}
        {filteredLeads.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalLeads={totalLeads}
              itemsPerPage={itemsPerPage}
              setCurrentPage={setCurrentPage}
              setItemsPerPage={setItemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Hide scrollbar utility class */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default GeneralLeads;
