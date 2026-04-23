import api from "./api";

const toApiLeaveType = (type = "") => {
  const normalized = String(type || "").toLowerCase();
  if (normalized === "special") return "medical";
  return normalized;
};

/**
 * Apply for a new leave.
 * @param {object} leaveData - { leaveType, startDate, endDate, reason, isHalfDay, session }
 */
export const applyLeave = async (leaveData) => {
  try {
    const payload = {
      type: leaveData.type || toApiLeaveType(leaveData.leaveType),
      fromDate: leaveData.fromDate || leaveData.startDate,
      toDate: leaveData.toDate || leaveData.endDate,
      reason: leaveData.reason || "",
      isHalfDay: Boolean(leaveData.isHalfDay),
      session: leaveData.isHalfDay ? leaveData.session || null : null,
    };

    const { data } = await api.post("/leave/apply", payload);
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Get leave history for the logged-in employee.
 */
export const getMyLeaves = async () => {
  try {
    const { data } = await api.get("/leave/my");
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Get leave balance for the logged-in employee.
 */
export const getLeaveBalance = async () => {
  try {
    const { data } = await api.get("/leave/summary");
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Get all pending leave requests (For Managers/Admins).
 */
export const getPendingLeaves = async () => {
  try {
    const { data } = await api.get("/leave/pending");
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

/**
 * Approve or Reject a leave request.
 * @param {string} id - Leave Record ID
 * @param {string} status - "Approved" or "Rejected"
 * @param {string} comment - Optional comment
 */
export const updateLeaveStatus = async (id, status, comment = "") => {
  try {
    const { data } = await api.patch(`/leave/${id}/status`, {
      status: status.toLowerCase(),
      remark: comment,
    });
    return data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
