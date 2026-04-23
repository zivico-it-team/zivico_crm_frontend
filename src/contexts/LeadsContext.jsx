/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { isHRUser } from "@/lib/roleUtils";

const LeadsContext = createContext();
const APPROVALS_STORAGE_KEY = "leadMasterDataApprovals";
const NOTIFICATIONS_STORAGE_KEY = "leadNotifications";
const LEADS_STORAGE_KEY = "leads";
const ASSIGNED_LEAD_POOL = "SL_EMP_ASSIGNED";
const UNASSIGNED_LEAD_POOL = "SL_EMP_UNASSIGNED";
const LEADS_CACHE_LIMIT = 200;
const MAX_CACHED_COMMENT_LENGTH = 500;

const normalizeAssignedTo = (assignedTo) => {
  if (!assignedTo) {
    return "";
  }

  if (typeof assignedTo === "string") {
    const normalized = assignedTo.trim();
    return normalized.toLowerCase() === "unassigned" ? "" : normalized;
  }

  return (
    assignedTo?.name ||
    assignedTo?.fullName ||
    assignedTo?.userName ||
    assignedTo?.email ||
    ""
  );
};

const normalizeAssignedToId = (assignedTo, assignedToId = "") => {
  if (typeof assignedTo === "object" && assignedTo) {
    return String(assignedTo?._id || assignedTo?.id || assignedToId || "");
  }

  return String(assignedToId || "");
};

const normalizeLeadPool = (leadPool) =>
  String(leadPool || "")
    .trim()
    .toUpperCase();

const normalizeLeadStatusValue = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isSalesDoneStage = (stage) =>
  ["sale done", "sales done", "converted"].includes(
    normalizeLeadStatusValue(stage),
  );

const getAssignmentStatus = ({
  assignedTo,
  assignedToId,
  leadPool,
  wasEverAssigned,
}) => {
  const normalizedLeadPool = normalizeLeadPool(leadPool);
  const hasCurrentAssignment =
    Boolean(normalizeAssignedTo(assignedTo)) ||
    Boolean(String(assignedToId || "").trim());
  if (hasCurrentAssignment || normalizedLeadPool === ASSIGNED_LEAD_POOL) {
    return "assigned";
  }
  if (Boolean(wasEverAssigned)) {
    return "unassigned";
  }
  return "available";
};

const mapApiLead = (lead) => {
  const assignedTo = normalizeAssignedTo(lead?.assignedTo);
  const assignedToId = normalizeAssignedToId(
    lead?.assignedTo,
    lead?.assignedToId,
  );
  const wasEverAssigned =
    Boolean(lead?.wasEverAssigned) ||
    Boolean(assignedTo) ||
    Boolean(assignedToId);
  const assignmentStatus = getAssignmentStatus({
    assignedTo: lead?.assignedTo,
    assignedToId,
    leadPool: lead?.leadPool,
    wasEverAssigned,
  });
  const hasAssignee = assignmentStatus === "assigned";
  const hasLeadDetailUpdates = Boolean(
    lead?.hasLeadDetailUpdates || lead?.isCompletedLead,
  );
  const isSalesDoneLead =
    Boolean(lead?.isSalesDoneLead) || isSalesDoneStage(lead?.stage);
  const isCompletedLead =
    Boolean(lead?.isCompletedLead) ||
    (hasLeadDetailUpdates && !isSalesDoneLead);
  const isNewLead =
    lead?.isNewLead !== undefined
      ? Boolean(lead?.isNewLead)
      : !isCompletedLead && !isSalesDoneLead;

  return {
    id: lead?._id || lead?.id || "",
    email: lead?.email || "",
    name: lead?.name || "",
    phone: lead?.phone || "",
    country: lead?.country || "",
    language: lead?.preferredLanguage || lead?.language || "",
    assignedTo: assignedTo || "Unassigned",
    assignedToId,
    wasEverAssigned,
    followUp: lead?.followUp || "N/A",
    followUpSetById: lead?.followUpSetById || "",
    followUpSetBy: lead?.followUpSetBy || "",
    followUpSetAt: lead?.followUpSetAt || null,
    followUpHandled: Boolean(lead?.followUpHandled),
    followUpHandledAt: lead?.followUpHandledAt || null,
    followUpHandledById: lead?.followUpHandledById || "",
    stage: lead?.stage || "New",
    tag: lead?.tag || "New Lead",
    comment: lead?.comment || "",
    assignedDate: lead?.assignedDate || null,
    ComplaintsType: lead?.ComplaintsType || "Standard",
    status: lead?.source === "excel" ? "fresh" : "active",
    assignmentStatus,
    isBookmarked: Boolean(lead?.isBookmarked),
    isArchived: Boolean(lead?.isArchived),
    uploadedBy: lead?.uploadedBy || "System",
    campaign: lead?.campaign || "General Campaign",
    source: lead?.source || "manual",
    uploadedAt: lead?.createdAt || new Date().toISOString(),
    createdAt: lead?.createdAt || new Date().toISOString(),
    updatedAt: lead?.updatedAt || lead?.createdAt || new Date().toISOString(),
    leadPool:
      lead?.leadPool ||
      (hasAssignee ? ASSIGNED_LEAD_POOL : UNASSIGNED_LEAD_POOL),
    fax: lead?.fax || "",
    gender: lead?.gender || "",
    dateOfBirth: lead?.dateOfBirth || "",
    hasLeadDetailUpdates,
    isCompletedLead,
    isNewLead,
    isSalesDoneLead,
  };
};

const readStoredArray = (storageKey) => {
  try {
    const savedValue = localStorage.getItem(storageKey);
    const parsedValue = savedValue ? JSON.parse(savedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const trimCachedText = (value, maxLength) => {
  if (typeof value !== "string") {
    return value || "";
  }

  return value.length > maxLength ? value.slice(0, maxLength) : value;
};

const createLeadCacheSnapshot = (leadList = []) =>
  (Array.isArray(leadList) ? leadList : []).slice(0, LEADS_CACHE_LIMIT).map(
    (lead) => ({
      id: lead?.id || "",
      email: lead?.email || "",
      name: lead?.name || "",
      phone: lead?.phone || "",
      country: lead?.country || "",
      language: lead?.language || "",
      assignedTo: lead?.assignedTo || "Unassigned",
      assignedToId: lead?.assignedToId || "",
      wasEverAssigned: Boolean(lead?.wasEverAssigned),
      followUp: lead?.followUp || "N/A",
      followUpSetById: lead?.followUpSetById || "",
      followUpSetBy: lead?.followUpSetBy || "",
      followUpSetAt: lead?.followUpSetAt || null,
      followUpHandled: Boolean(lead?.followUpHandled),
      followUpHandledAt: lead?.followUpHandledAt || null,
      followUpHandledById: lead?.followUpHandledById || "",
      stage: lead?.stage || "New",
      tag: lead?.tag || "New Lead",
      comment: trimCachedText(lead?.comment, MAX_CACHED_COMMENT_LENGTH),
      assignedDate: lead?.assignedDate || null,
      ComplaintsType: lead?.ComplaintsType || "Standard",
      status: lead?.status || "active",
      assignmentStatus: lead?.assignmentStatus || "available",
      isBookmarked: Boolean(lead?.isBookmarked),
      isArchived: Boolean(lead?.isArchived),
      uploadedBy: lead?.uploadedBy || "System",
      campaign: lead?.campaign || "General Campaign",
      source: lead?.source || "manual",
      uploadedAt: lead?.uploadedAt || lead?.createdAt || new Date().toISOString(),
      createdAt: lead?.createdAt || lead?.uploadedAt || new Date().toISOString(),
      updatedAt:
        lead?.updatedAt ||
        lead?.uploadedAt ||
        lead?.createdAt ||
        new Date().toISOString(),
      leadPool: lead?.leadPool || UNASSIGNED_LEAD_POOL,
      fax: lead?.fax || "",
      gender: lead?.gender || "",
      dateOfBirth: lead?.dateOfBirth || "",
      hasLeadDetailUpdates: Boolean(
        lead?.hasLeadDetailUpdates || lead?.isCompletedLead,
      ),
      isCompletedLead: Boolean(lead?.isCompletedLead),
      isNewLead: Boolean(lead?.isNewLead),
      isSalesDoneLead: Boolean(lead?.isSalesDoneLead),
    }),
  );

const persistStoredArray = (storageKey, value) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to persist "${storageKey}" in localStorage.`, error);
  }
};

const readCachedLeads = () => readStoredArray(LEADS_STORAGE_KEY);

const isLeadEndpointMissing = (error) => {
  const status = Number(error?.response?.status || 0);
  return status === 404 || status === 405;
};

const shouldUseLocalLeadFallback = (error) => {
  const status = Number(error?.response?.status || 0);
  return status === 0 || status >= 500 || isLeadEndpointMissing(error);
};

const createLocalLead = (lead, uploader) => {
  const nowIso = new Date().toISOString();
  return mapApiLead({
    id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: lead?.name || "",
    email: lead?.email || "",
    phone: lead?.phone || lead?.phoneNumber || "",
    campaign: lead?.campaign || "General Campaign",
    comment: lead?.comment || "",
    source: lead?.source || "manual",
    uploadedBy: lead?.uploadedBy || uploader || "System",
    createdAt: nowIso,
    updatedAt: nowIso,
    assignedTo: lead?.assignedTo || "",
    assignedToId: lead?.assignedToId || "",
    wasEverAssigned: Boolean(lead?.wasEverAssigned),
    assignedDate: lead?.assignedDate || "",
    followUp: lead?.followUp || "",
    tag: lead?.tag || "New Lead",
    stage: lead?.stage || "New",
    leadPool: lead?.leadPool || "",
    country: lead?.country || "",
    language: lead?.language || "",
    ComplaintsType: lead?.ComplaintsType || "Standard",
    fax: lead?.fax || "",
    gender: lead?.gender || "",
    dateOfBirth: lead?.dateOfBirth || "",
  });
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
};

export const LeadsProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id;
  const [leads, setLeads] = useState(() => readCachedLeads());
  const [masterDataApprovals, setMasterDataApprovals] = useState(() =>
    readStoredArray(APPROVALS_STORAGE_KEY),
  );
  const [notifications, setNotifications] = useState(() =>
    readStoredArray(NOTIFICATIONS_STORAGE_KEY),
  );

  // Save to localStorage whenever leads change
  useEffect(() => {
    persistStoredArray(LEADS_STORAGE_KEY, createLeadCacheSnapshot(leads));
  }, [leads]);
  useEffect(() => {
    persistStoredArray(APPROVALS_STORAGE_KEY, masterDataApprovals);
  }, [masterDataApprovals]);
  useEffect(() => {
    persistStoredArray(NOTIFICATIONS_STORAGE_KEY, notifications);
  }, [notifications]);

  const refreshLeads = useCallback(async () => {
    if (isHRUser(currentUser)) {
      setLeads([]);
      return [];
    }

    try {
      const params = { page: 1, limit: 1000 };

      const { data } = await api.get("/leads", {
        params,
      });
      const items = Array.isArray(data?.items) ? data.items : [];
      const mappedLeads = items.map(mapApiLead);
      setLeads(mappedLeads);
      return mappedLeads;
    } catch (error) {
      const status = Number(error?.response?.status || 0);
      const cachedLeads = readCachedLeads();

      if (status !== 404 && status !== 405) {
        console.error("Error refreshing leads:", error);
      }

      setLeads((prev) => {
        if (prev.length > 0 || cachedLeads.length === 0) {
          return prev;
        }
        return cachedLeads;
      });
      return cachedLeads;
    }
  }, [currentUser]);

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    if (isHRUser(currentUser)) {
      // Keep HR experience independent from leads module.
      setLeads([]);
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshLeads();
  }, [currentUserId, currentUser, refreshLeads]);

  const addLeads = async (newLeads) => {
    const payloadLeads = newLeads || [];
    try {
      const created = await Promise.all(
        payloadLeads.map((lead) =>
          api.post("/leads", {
            name: lead?.name || "",
            email: lead?.email || "",
            phone: lead?.phone || lead?.phoneNumber || "",
            campaign: lead?.campaign || "General Campaign",
            comment: lead?.comment || "",
            source: lead?.source || "manual",
            uploadedBy: lead?.uploadedBy || currentUser?.name || "System",
          }),
        ),
      );

      const mapped = created.map((response) =>
        mapApiLead(response?.data?.lead || response?.data),
      );
      setLeads((prev) => [...mapped, ...prev]);
      return mapped;
    } catch (error) {
      if (!shouldUseLocalLeadFallback(error)) {
        throw error;
      }

      const fallbackCreated = payloadLeads.map((lead) =>
        createLocalLead(lead, currentUser?.name),
      );
      setLeads((prev) => [...fallbackCreated, ...prev]);
      return fallbackCreated;
    }
  };

  const toggleBookmark = async (id) => {
    try {
      const { data } = await api.patch(`/leads/${id}/bookmark`);
      const updated = mapApiLead(data);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
      return updated;
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }

      let updated = null;
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id) return lead;
          updated = mapApiLead({
            ...lead,
            isBookmarked: !lead.isBookmarked,
          });
          return updated;
        }),
      );
      return updated;
    }
  };

  const toggleArchive = async (id) => {
    try {
      const { data } = await api.patch(`/leads/${id}/archive`);
      const updated = mapApiLead(data);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
      return updated;
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }

      let updated = null;
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id) return lead;
          updated = mapApiLead({
            ...lead,
            isArchived: !lead.isArchived,
          });
          return updated;
        }),
      );
      return updated;
    }
  };

  const updateLead = async (idOrLead, updatedData = null) => {
    const leadId = typeof idOrLead === "object" ? idOrLead.id : idOrLead;
    const payload = typeof idOrLead === "object" ? idOrLead : updatedData;

    const requestBody = {
      name: payload?.name || "",
      email: payload?.email || "",
      phone: payload?.phone || payload?.phoneNumber || "",
      fax: payload?.fax || "",
      gender: payload?.gender || "",
      dateOfBirth: payload?.dateOfBirth || "",
      country: payload?.country || "",
      language: payload?.language || "",
      campaign: payload?.campaign || "",
      leadPool: payload?.leadPool || "",
      assignedTo:
        payload?.assignedTo === "Unassigned" ? "" : payload?.assignedTo || "",
      assignedToId: payload?.assignedToId || "",
      wasEverAssigned: Boolean(payload?.wasEverAssigned),
      assignedDate: payload?.assignedDate || "",
      followUp: payload?.followUp === "N/A" ? "" : payload?.followUp || "",
      ComplaintsType: payload?.ComplaintsType || "",
    };

    try {
      const { data } = await api.put(
        `/leads/${leadId}/master-data`,
        requestBody,
      );
      const updated = mapApiLead(data?.lead || data);
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? updated : lead)),
      );
      return updated;
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }

      let updated = null;
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== leadId) return lead;

          updated = mapApiLead({
            ...lead,
            ...payload,
            phone: payload?.phone || payload?.phoneNumber || lead.phone,
            assignedTo:
              payload?.assignedTo === "Unassigned"
                ? ""
                : payload?.assignedTo || lead.assignedTo,
            assignedToId: payload?.assignedToId || lead.assignedToId || "",
            wasEverAssigned: payload?.wasEverAssigned ?? lead.wasEverAssigned,
            followUp: payload?.followUp || lead.followUp,
            updatedAt: new Date().toISOString(),
            hasLeadDetailUpdates: true,
          });
          return updated;
        }),
      );
      return updated;
    }
  };

  const assignLeadsToEmployee = useCallback((leadIds = [], employee = {}) => {
    const ids = new Set((leadIds || []).map((id) => String(id)));
    const assignedTo =
      employee?.name ||
      employee?.fullName ||
      employee?.userName ||
      employee?.email ||
      "Unassigned";
    const assignedToId = String(employee?._id || employee?.id || "");
    const assignedDate = new Date().toISOString();

    setLeads((prev) =>
      prev.map((lead) => {
        if (!ids.has(String(lead.id))) {
          return lead;
        }

        return {
          ...lead,
          assignedTo,
          assignedToId,
          wasEverAssigned: true,
          assignedDate,
          leadPool: ASSIGNED_LEAD_POOL,
          assignmentStatus: "assigned",
        };
      }),
    );
  }, []);

  const unassignLeads = useCallback((leadIds = []) => {
    const ids = new Set((leadIds || []).map((id) => String(id)));

    setLeads((prev) =>
      prev.map((lead) => {
        if (!ids.has(String(lead.id))) {
          return lead;
        }

        return {
          ...lead,
          assignedTo: "Unassigned",
          assignedToId: "",
          wasEverAssigned: true,
          assignedDate: "",
          leadPool: UNASSIGNED_LEAD_POOL,
          assignmentStatus: "unassigned",
        };
      }),
    );
  }, []);

  const updateLeadTag = async (id, newTag) => {
    try {
      const { data } = await api.put(`/leads/${id}/tag`, { tag: newTag });
      const updated = mapApiLead(data?.lead || data);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
      return updated;
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }

      let updated = null;
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id) return lead;
          updated = mapApiLead({
            ...lead,
            tag: newTag,
            hasLeadDetailUpdates: true,
          });
          return updated;
        }),
      );
      return updated;
    }
  };

  const updateLeadStage = async (id, newStage) => {
    try {
      const { data } = await api.put(`/leads/${id}/stage`, { stage: newStage });
      const updated = mapApiLead(data?.lead || data);
      setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
      return updated;
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }

      let updated = null;
      setLeads((prev) =>
        prev.map((lead) => {
          if (lead.id !== id) return lead;
          updated = mapApiLead({
            ...lead,
            stage: newStage,
            hasLeadDetailUpdates: true,
          });
          return updated;
        }),
      );
      return updated;
    }
  };

  const deleteLead = async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    }
  };

  const deleteMultipleLeads = async (ids) => {
    const safeIds = ids || [];
    try {
      await Promise.all(safeIds.map((id) => api.delete(`/leads/${id}`)));
      setLeads((prev) => prev.filter((lead) => !safeIds.includes(lead.id)));
    } catch (error) {
      if (!isLeadEndpointMissing(error)) {
        throw error;
      }
      setLeads((prev) => prev.filter((lead) => !safeIds.includes(lead.id)));
    }
  };

  // Get lead by id
  const getLeadById = (id) => {
    return leads.find((lead) => lead.id === id);
  };

  // Get leads by tag
  const getLeadsByTag = (tag) => {
    return leads.filter((lead) => lead.tag === tag);
  };

  // Get unique tags from all leads
  const getAllTags = () => {
    const tags = leads.map((lead) => lead.tag);
    return ["All", ...new Set(tags.filter((tag) => tag))];
  };

  const getPendingApprovalsForRole = useCallback(
    (role) => {
      if (!role || (role !== "admin" && role !== "manager")) {
        return [];
      }
      return masterDataApprovals.filter(
        (request) => request.status === "pending",
      );
    },
    [masterDataApprovals],
  );

  const approveMasterDataApproval = useCallback((requestId, approver) => {
    let approvedRequest = null;

    setMasterDataApprovals((prev) =>
      prev.map((request) => {
        if (request.id !== requestId || request.status !== "pending") {
          return request;
        }
        approvedRequest = {
          ...request,
          status: "approved",
          reviewedAt: new Date().toISOString(),
          reviewedBy: {
            id: approver?.id || "",
            name: approver?.name || "System",
            role: approver?.role || "system",
          },
        };
        return approvedRequest;
      }),
    );

    if (approvedRequest?.requestedBy?.id) {
      setNotifications((prev) => [
        {
          id: `notif_${Date.now()}`,
          userId: approvedRequest.requestedBy.id,
          status: "approved",
          message: `Master data request for "${approvedRequest.leadName}" was approved.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          requestId: approvedRequest.id,
        },
        ...prev,
      ]);
    }

    return approvedRequest;
  }, []);

  const rejectMasterDataApproval = useCallback(
    (requestId, approver, reason = "") => {
      let rejectedRequest = null;

      setMasterDataApprovals((prev) =>
        prev.map((request) => {
          if (request.id !== requestId || request.status !== "pending") {
            return request;
          }
          rejectedRequest = {
            ...request,
            status: "rejected",
            rejectReason: reason,
            reviewedAt: new Date().toISOString(),
            reviewedBy: {
              id: approver?.id || "",
              name: approver?.name || "System",
              role: approver?.role || "system",
            },
          };
          return rejectedRequest;
        }),
      );

      if (rejectedRequest?.requestedBy?.id) {
        setNotifications((prev) => [
          {
            id: `notif_${Date.now()}`,
            userId: rejectedRequest.requestedBy.id,
            status: "rejected",
            message: `Master data request for "${rejectedRequest.leadName}" was rejected.`,
            isRead: false,
            createdAt: new Date().toISOString(),
            requestId: rejectedRequest.id,
          },
          ...prev,
        ]);
      }

      return rejectedRequest;
    },
    [],
  );

  const getNotificationsForUser = useCallback(
    (userId) => {
      if (!userId) {
        return [];
      }
      return notifications
        .filter((item) => item.userId === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    [notifications],
  );

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );
  }, []);

  return (
    <LeadsContext.Provider
      value={{
        leads,
        setLeads,
        refreshLeads,
        addLeads,
        toggleBookmark,
        toggleArchive,
        updateLead,
        updateLeadTag,
        updateLeadStage,
        deleteLead,
        deleteMultipleLeads,
        assignLeadsToEmployee,
        unassignLeads,
        getLeadById,
        getLeadsByTag,
        getAllTags,
        getPendingApprovalsForRole,
        approveMasterDataApproval,
        rejectMasterDataApproval,
        getNotificationsForUser,
        markNotificationAsRead,
        masterDataApprovals,
        currentUser,
      }}
    >
      {children}
    </LeadsContext.Provider>
  );
};
