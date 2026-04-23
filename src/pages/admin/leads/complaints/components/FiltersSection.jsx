import React from "react";

const FiltersSection = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  showFilters,
  setShowFilters,
  priorityFilter,
  setPriorityFilter,
  typeFilter,
  setTypeFilter,
}) => {
  const statusButtons = [
    { value: "all", label: "All", color: "blue" },
    { value: "pending", label: "Pending", color: "yellow" },
    { value: "in progress", label: "In Progress", color: "blue" },
    { value: "resolved", label: "Resolved", color: "green" },
    { value: "exceeded", label: "Exceeded", color: "red" },
  ];

  const getStatusButtonClass = (button) => {
    if (statusFilter !== button.value)
      return "bg-gray-100 text-gray-700 hover:bg-gray-200";

    const colorClasses = {
      red: "bg-red-600 text-white",
      yellow: "bg-yellow-600 text-white",
      blue: "bg-blue-600 text-white",
      green: "bg-green-600 text-white",
    };
    return colorClasses[button.color] || "bg-blue-600 text-white";
  };

  return (
    <div className="p-4 border-b border-gray-200 sm:p-6">
      {/* Mobile Search and Filter Toggle */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="relative">
          <svg
            className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search Compliance..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
          </button>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="exceeded">Exceeded</option>
          </select>
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex sm:flex-col sm:gap-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap gap-2">
            {statusButtons.map((button) => (
              <button
                key={button.value}
                onClick={() => setStatusFilter(button.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${getStatusButtonClass(button)}`}
              >
                {button.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="hidden md:inline">
                {showFilters ? "Hide" : "More"} Filters
              </span>
              <span className="md:hidden">Filters</span>
              <svg
                className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            <div className="relative w-64 xl:w-80">
              <svg
                className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search Compliance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                Priority
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="service">Service Issue</option>
                <option value="delay">Delay in Response</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Issue</option>
                <option value="product">Product Issue</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-gray-700 sm:text-sm">
                Date Range
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <span className="hidden text-gray-500 sm:inline">to</span>
                <input
                  type="date"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersSection;
