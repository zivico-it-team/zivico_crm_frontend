import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  FileText,
  Globe,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  Star,
  User,
  X,
} from "lucide-react";
import { useLeads } from "@/contexts/LeadsContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { buildAvatarUrl } from "@/lib/avatar";
import LeadStageBadge from "../general/components/LeadStageBadge";
import TagBadge from "../general/components/TagBadge";

const AVAILABLE_TAGS = [
  "New Lead",
  "No Answer",
  "Duplicate",
  "Invalid Number",
  "Not Interested",
  "Other Language",
  "Phone Off",
  "Existing Client (Invested)",
  "Number Busy",
  "Whats-App (Following)",
];
const AVAILABLE_STAGES = [
  "New",
  "Registered",
  "Ongoing Followup",
  "Sales Not Interested",
  "Sale Done",
];
const TABS = { SUMMARY: "summary", ACTIVITIES: "activities", CALLS: "calls" };
const VISIBLE = 6;
const isSalesDoneStage = (stage) =>
  ["sale done", "sales done", "converted"].includes(
    String(stage || "").trim().toLowerCase(),
  );

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const {
    leads,
    setLeads,
    toggleBookmark,
    toggleArchive,
    updateLead,
    updateLeadTag,
    updateLeadStage,
  } = useLeads();

  const [lead, setLead] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.SUMMARY);
  const [timeline, setTimeline] = useState([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showTagModal, setShowTagModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [showMasterPermissionModal, setShowMasterPermissionModal] =
    useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [master, setMaster] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    fax: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    language: "",
    campaign: "",
    assignee: "",
    assignedDate: "",
    upcomingFollowup: "",
    leadPool: "",
    ComplaintsType: "",
  });

  const [commentInput, setCommentInput] = useState("");
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [reminderError, setReminderError] = useState("");
  const currentUserId = useMemo(
    () => String(currentUser?._id || currentUser?.id || ""),
    [currentUser?._id, currentUser?.id],
  );
  const canViewReminderForLead = useMemo(
    () =>
      Boolean(currentUserId) &&
      String(lead?.followUpSetById || "") === currentUserId,
    [currentUserId, lead?.followUpSetById],
  );
  const isEmployeeUser =
    String(currentUser?.role || "").toLowerCase() === "employee";

  useEffect(() => {
    const fromContext = leads.find((item) => String(item.id) === String(id));
    const fromState = location.state?.leadData;
    if (fromContext) return setLead(fromContext);
    if (fromState && String(fromState.id) === String(id))
      return setLead(fromState);
    setLead(null);
  }, [id, leads, location.state]);

  useEffect(() => {
    if (!lead) return;
    setSelectedTag(lead.tag || "New Lead");
    setSelectedStage(lead.stage || "New");
    const isOwnReminder =
      Boolean(currentUserId) &&
      String(lead.followUpSetById || "") === currentUserId;
    setReminderDateTime(
      isOwnReminder ? toDateTimeInputValue(lead.followUp) : "",
    );
    setMaster({
      name: lead.name || "",
      email: lead.email || "",
      phoneNumber: lead.phone || "",
      fax: lead.fax || "",
      dateOfBirth: lead.dateOfBirth || "",
      gender: lead.gender || "",
      country: lead.country || "",
      language: lead.language || "",
      campaign: lead.campaign || "",
      assignee: lead.assignedTo || "",
      assignedDate: toDateInputValue(lead.assignedDate),
      upcomingFollowup: isOwnReminder ? lead.followUp || "" : "",
      leadPool: lead.leadPool || "",
      ComplaintsType: lead.ComplaintsType || "",
    });
  }, [lead, currentUserId]);

  const loadTimeline = useCallback(async (leadId) => {
    if (!leadId) return;
    try {
      setLoadingTimeline(true);
      const { data } = await api.get(`/leads/${leadId}/timeline`);
      setTimeline(Array.isArray(data?.items) ? data.items : []);
    } catch (error) {
      console.error("Error loading timeline:", error);
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  }, []);

  useEffect(() => {
    if (lead?.id) loadTimeline(lead.id);
  }, [lead?.id, loadTimeline]);

  const shownTimeline = useMemo(
    () => (expanded ? timeline : timeline.slice(0, VISIBLE)),
    [timeline, expanded],
  );
  const callItems = useMemo(
    () =>
      timeline.filter((x) =>
        `${x?.action || ""} ${x?.details || ""}`
          .toLowerCase()
          .match(/call|phone/),
      ),
    [timeline],
  );
  const commentItems = useMemo(() => {
    const fromTimeline = timeline
      .filter(
        (item) =>
          String(item?.action || "")
            .trim()
            .toLowerCase() === "comment added",
      )
      .map((item) => ({
        id: item.id,
        text: item.details || "",
        createdBy: item.changedBy || "System",
        createdAt: item.at || null,
        createdByAvatar:
          item.changedByProfileImageUrl || item.changedByAvatar || "",
        createdByAvatarVersion: item.changedByProfileImageVersion || null,
      }));

    if (fromTimeline.length > 0) return fromTimeline;

    if (!lead?.comment) return [];
    return [
      {
        id: `base-${lead.id}`,
        text: String(lead.comment),
        createdBy: lead.uploadedBy || lead.assignedTo || "System",
        createdAt: lead.updatedAt || lead.createdAt || new Date().toISOString(),
        createdByAvatar: "",
        createdByAvatarVersion: null,
      },
    ];
  }, [
    timeline,
    lead?.comment,
    lead?.id,
    lead?.uploadedBy,
    lead?.assignedTo,
    lead?.updatedAt,
    lead?.createdAt,
  ]);

  const currentUserAvatar = useMemo(
    () => buildAvatarUrl(currentUser || {}),
    [currentUser],
  );
  const fmt = (v) => v || "-";

  const handleBookmarkToggle = async () => {
    if (!lead?.id) return;
    try {
      const updated = await toggleBookmark(lead.id);
      setLead(updated);
      toast({
        title: updated.isBookmarked ? "Lead Bookmarked" : "Bookmark Removed",
        description: "Lead bookmark status updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message || "Failed to update bookmark.",
        variant: "destructive",
      });
    }
  };
  const handleArchiveToggle = async () => {
    if (!lead?.id) return;
    try {
      const updated = await toggleArchive(lead.id);
      setLead(updated);
      toast({
        title: updated.isArchived ? "Lead Archived" : "Lead Unarchived",
        description: "Lead archive status updated.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message || "Failed to update archive state.",
        variant: "destructive",
      });
    }
  };
  const handleTagUpdate = async () => {
    if (!lead?.id || !selectedTag) return;
    try {
      setSaving(true);
      const updated = await updateLeadTag(lead.id, selectedTag);
      setLead(updated);
      await loadTimeline(updated?.id || lead.id);
      setShowTagModal(false);
      toast({
        title: "Tag Updated",
        description: `Lead tag changed to "${selectedTag}".`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message || "Failed to update lead tag.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleStageUpdate = async () => {
    if (!lead?.id || !selectedStage) return;
    try {
      setSaving(true);
      const updated = await updateLeadStage(lead.id, selectedStage);
      setLead(updated);
      await loadTimeline(updated?.id || lead.id);
      setShowStageModal(false);
      toast({
        title: "Stage Updated",
        description: `Lead stage changed to "${selectedStage}".`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message || "Failed to update lead stage.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleMasterDataSubmit = async () => {
    if (!lead?.id) return;
    if (isEmployeeUser) {
      setShowMasterPermissionModal(true);
      return;
    }
    try {
      setSaving(true);
      const updated = await updateLead(lead.id, {
        ...lead,
        name: master.name,
        email: master.email,
        phone: master.phoneNumber,
        fax: master.fax,
        dateOfBirth: master.dateOfBirth,
        gender: master.gender,
        country: master.country,
        language: master.language,
        campaign: master.campaign,
        leadPool: master.leadPool,
        assignedTo: master.assignee,
        assignedDate: master.assignedDate,
        followUp: master.upcomingFollowup,
        ComplaintsType: master.ComplaintsType,
      });
      setLead(updated);
      await loadTimeline(updated?.id || lead.id);
      setShowMasterModal(false);
      toast({
        title: "Master Data Updated",
        description: "Lead master data updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error?.response?.data?.message ||
          "Failed to update lead master data.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleOpenMasterData = useCallback(() => {
    if (isEmployeeUser) {
      setShowMasterPermissionModal(true);
      return;
    }

    setShowMasterModal(true);
  }, [isEmployeeUser]);
  const handleReminderSubmit = async () => {
    if (!lead?.id) return;
    if (!reminderDateTime)
      return setReminderError("Please select reminder date and time.");
    const reminder = new Date(reminderDateTime);
    if (Number.isNaN(reminder.getTime()) || reminder.getTime() <= Date.now())
      return setReminderError("Reminder time must be in the future.");
    try {
      setSaving(true);
      setReminderError("");
      const updated = await updateLead(lead.id, {
        ...lead,
        followUp: reminder.toISOString(),
      });
      setLead(updated);
      setShowReminderModal(false);
      await loadTimeline(updated?.id || lead.id);
      toast({
        title: "Reminder Set",
        description: `Follow-up set for ${formatTimelineDate(reminder.toISOString())}.`,
      });
    } catch (error) {
      toast({
        title: "Reminder Failed",
        description:
          error?.response?.data?.message || "Failed to set reminder.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  const handleCopyValue = useCallback(
    async (label, rawValue) => {
      const value = String(rawValue || "").trim();
      if (!value) return;
      try {
        if (navigator?.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
        } else {
          throw new Error("Clipboard API unavailable");
        }
        toast({
          title: `${label} Copied`,
          description: `${label} copied to clipboard.`,
        });
      } catch (error) {
        toast({
          title: "Copy Failed",
          description: `Unable to copy ${label.toLowerCase()}.`,
          variant: "destructive",
        });
        console.error(`Failed to copy ${label}:`, error);
      }
    },
    [toast],
  );
  const handleAddComment = async () => {
    const text = commentInput.trim();
    if (!text) return;
    try {
      setSaving(true);
      const { data } = await api.post(`/leads/${lead.id}/comments`, {
        comment: text,
      });
      const returnedLead = data?.lead || {};
      const updatedComment = String(returnedLead?.comment || text).trim();
      const updatedAt = returnedLead?.updatedAt || new Date().toISOString();
      const salesDoneLead = isSalesDoneStage(returnedLead?.stage || lead?.stage);
      const nextLeadState = {
        ...lead,
        ...returnedLead,
        comment: updatedComment,
        updatedAt,
        hasLeadDetailUpdates: true,
        isCompletedLead: !salesDoneLead,
        isNewLead: false,
        isSalesDoneLead: salesDoneLead,
      };

      setLead(nextLeadState);
      setLeads((prev) =>
        prev.map((item) =>
          String(item.id) === String(lead.id)
            ? { ...item, ...nextLeadState }
            : item,
        ),
      );
      setCommentInput("");
      await loadTimeline(lead.id);
      toast({
        title: "Comment Added",
        description: "Comment saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Comment Failed",
        description:
          error?.response?.data?.message || "Failed to save comment.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!lead)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="p-8 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Lead Not Found
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            The requested lead could not be loaded.
          </p>
          <button
            onClick={() => navigate("/leads/general")}
            className="mt-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
          >
            Back to Leads
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <header className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                className="mt-1 p-2 rounded-lg border border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {fmt(lead.name)}
                </h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Lead information and activity management
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <TagBadge tag={lead.tag || "New Lead"} />
                  <LeadStageBadge stage={lead.stage || "New"} />
                  <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full px-3 py-1 text-xs">
                    Follow Up:{" "}
                    {canViewReminderForLead && lead.followUp
                      ? formatTimelineDate(lead.followUp)
                      : "Not set"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmarkToggle}
                className={`rounded-lg px-4 py-2 text-sm border inline-flex items-center gap-2 ${lead.isBookmarked ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
              >
                <Star
                  className={`w-4 h-4 ${lead.isBookmarked ? "fill-current" : ""}`}
                />
                Bookmark
              </button>
              <button
                onClick={handleArchiveToggle}
                className={`rounded-lg px-4 py-2 text-sm border inline-flex items-center gap-2 ${lead.isArchived ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800" : "border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
            </div>
          </div>
          <div className="mt-6 border-b border-gray-200 dark:border-slate-800 pb-3 flex gap-2 overflow-x-auto">
            <TabButton
              active={activeTab === TABS.SUMMARY}
              onClick={() => setActiveTab(TABS.SUMMARY)}
            >
              Summary
            </TabButton>
            <TabButton
              active={activeTab === TABS.ACTIVITIES}
              onClick={() => setActiveTab(TABS.ACTIVITIES)}
            >
              Activities
            </TabButton>
            <TabButton
              active={activeTab === TABS.CALLS}
              onClick={() => setActiveTab(TABS.CALLS)}
            >
              Call History
            </TabButton>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2 space-y-6">
            {activeTab === TABS.SUMMARY && (
              <>
                <SectionCard title="Lead Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoItem
                      icon={Mail}
                      label="Email"
                      value={lead.email}
                      copyEnabled
                      onCopy={() => handleCopyValue("Email", lead.email)}
                    />
                    <InfoItem
                      icon={Globe}
                      label="Country"
                      value={lead.country}
                    />
                    <InfoItem
                      icon={Phone}
                      label="Phone"
                      value={lead.phone}
                      copyEnabled
                      onCopy={() => handleCopyValue("Phone Number", lead.phone)}
                    />
                    <InfoItem
                      icon={MessageSquare}
                      label="Language"
                      value={lead.language}
                    />
                    <InfoItem
                      icon={Calendar}
                      label="Registration Date"
                      value={formatTimelineDate(lead.assignedDate)}
                    />
                    <InfoItem
                      icon={User}
                      label="Assigned To"
                      value={lead.assignedTo || "Unassigned"}
                    />
                    <InfoItem
                      icon={Clock3}
                      label="Follow Up Date"
                      value={
                        canViewReminderForLead
                          ? formatTimelineDate(lead.followUp)
                          : "-"
                      }
                    />
                    <InfoItem
                      icon={Briefcase}
                      label="Stage"
                      value={lead.stage}
                    />
                    <InfoItem icon={FileText} label="Tag" value={lead.tag} />
                    <InfoItem
                      icon={Briefcase}
                      label="Lead Pool"
                      value={lead.leadPool}
                    />
                    {/* <InfoItem
                      icon={Check}
                      label="Complaints"
                      value={lead.ComplaintsType}
                    /> */}
                  </div>
                  <div className="mt-4 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-lg p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
                      Comment
                    </p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-slate-200">
                      {fmt(lead.comment)}
                    </p>
                  </div>
                </SectionCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionCard
                    icon={FileText}
                    title="Lead Tag"
                    description="Organize lead qualification status."
                    content={<TagBadge tag={lead.tag || "New Lead"} />}
                    onClick={() => setShowTagModal(true)}
                    actionLabel="Set Lead Tag"
                  />
                  <ActionCard
                    icon={Briefcase}
                    title="Lead Stage"
                    description="Move lead through your pipeline."
                    content={<LeadStageBadge stage={lead.stage || "New"} />}
                    onClick={() => setShowStageModal(true)}
                    actionLabel="Set Lead Stage"
                  />
                  <ActionCard
                    icon={Calendar}
                    title="Reminder"
                    description="Schedule and manage follow-up."
                    content={
                      <span className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full px-3 py-1 text-xs">
                        {canViewReminderForLead && lead.followUp
                          ? formatTimelineDate(lead.followUp)
                          : "No reminder set"}
                      </span>
                    }
                    onClick={() => setShowReminderModal(true)}
                    actionLabel="Set Reminder"
                  />
                  <ActionCard
                    icon={User}
                    title="Master Data"
                    description="Edit core lead profile fields."
                    content={
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        {lead.campaign || "General Campaign"}
                      </span>
                    }
                    onClick={handleOpenMasterData}
                    actionLabel="Update Master Data"
                  />
                </div>

                <SectionCard title="Comments">
                  <div className="border border-gray-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-3">
                    <div className="flex gap-3">
                      <Avatar className="w-8 h-8 border border-gray-200 dark:border-slate-700">
                        {currentUserAvatar ? (
                          <AvatarImage
                            src={currentUserAvatar}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-semibold">
                          {(currentUser?.name || currentUser?.userName || "Y")
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <input
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={saving}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    {commentItems.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        No comments yet.
                      </p>
                    ) : (
                      commentItems.map((c) => (
                        <div
                          key={c.id}
                          className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl p-4"
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="w-9 h-9 border border-blue-100 dark:border-blue-900/40">
                              {c.createdByAvatar ? (
                                <AvatarImage
                                  src={buildAvatarUrl({
                                    profileImageUrl: c.createdByAvatar,
                                    profileImageVersion:
                                      c.createdByAvatarVersion,
                                  })}
                                  className="object-cover"
                                />
                              ) : null}
                              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                                {(c.createdBy || "U").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                                  {c.createdBy || "User"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                  {formatTimelineDate(c.createdAt)}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-700 dark:text-slate-200">
                                {c.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </SectionCard>
              </>
            )}
            {activeTab === TABS.ACTIVITIES && (
              <SectionCard title="Activities">
                <TimelineList loading={loadingTimeline} items={shownTimeline} />
                {timeline.length > VISIBLE && (
                  <SeeMore
                    expanded={expanded}
                    onClick={() => setExpanded((p) => !p)}
                  />
                )}
              </SectionCard>
            )}
            {activeTab === TABS.CALLS && (
              <SectionCard title="Call History">
                {loadingTimeline ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Loading call history...
                  </p>
                ) : callItems.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    No call records in timeline yet. This tab uses existing
                    backend timeline data.
                  </p>
                ) : (
                  <TimelineList loading={false} items={callItems} />
                )}
              </SectionCard>
            )}
          </main>

          <aside className="lg:col-span-1">
            <SectionCard title="Timeline Activity">
              <TimelineList
                loading={loadingTimeline}
                items={shownTimeline}
                compact
              />
              {timeline.length > VISIBLE && (
                <SeeMore
                  expanded={expanded}
                  onClick={() => setExpanded((p) => !p)}
                />
              )}
            </SectionCard>
          </aside>
        </div>
      </div>

      {showTagModal && (
        <SelectionModal
          title="Select Tag"
          options={AVAILABLE_TAGS}
          selectedValue={selectedTag}
          onSelect={setSelectedTag}
          onClose={() => setShowTagModal(false)}
          onSubmit={handleTagUpdate}
          saving={saving}
        />
      )}
      {showStageModal && (
        <SelectionModal
          title="Select Stage"
          options={AVAILABLE_STAGES}
          selectedValue={selectedStage}
          onSelect={setSelectedStage}
          onClose={() => setShowStageModal(false)}
          onSubmit={handleStageUpdate}
          saving={saving}
        />
      )}
      {showMasterModal && (
        <ModalShell
          title="Master Data"
          onClose={() => setShowMasterModal(false)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MasterDataInput
              label="Name"
              value={master.name}
              onChange={(v) => setMaster((p) => ({ ...p, name: v }))}
            />
            <MasterDataInput
              label="Email"
              value={master.email}
              onChange={(v) => setMaster((p) => ({ ...p, email: v }))}
            />
            <MasterDataInput
              label="Phone Number"
              value={master.phoneNumber}
              onChange={(v) => setMaster((p) => ({ ...p, phoneNumber: v }))}
            />
            <MasterDataInput
              label="Fax"
              value={master.fax}
              onChange={(v) => setMaster((p) => ({ ...p, fax: v }))}
            />
            <MasterDataInput
              label="Date Of Birth"
              type="date"
              value={master.dateOfBirth}
              onChange={(v) => setMaster((p) => ({ ...p, dateOfBirth: v }))}
            />
            <MasterDataInput
              label="Gender"
              value={master.gender}
              onChange={(v) => setMaster((p) => ({ ...p, gender: v }))}
            />
            <MasterDataInput
              label="Country"
              value={master.country}
              onChange={(v) => setMaster((p) => ({ ...p, country: v }))}
            />
            <MasterDataInput
              label="Language"
              value={master.language}
              onChange={(v) => setMaster((p) => ({ ...p, language: v }))}
            />
            <MasterDataInput
              label="Campaign"
              value={master.campaign}
              onChange={(v) => setMaster((p) => ({ ...p, campaign: v }))}
            />
            <MasterDataInput
              label="Assignee"
              value={master.assignee}
              onChange={(v) => setMaster((p) => ({ ...p, assignee: v }))}
            />
            <MasterDataInput
              label="Assigned Date"
              type="date"
              value={master.assignedDate}
              onChange={(v) => setMaster((p) => ({ ...p, assignedDate: v }))}
            />
            <MasterDataInput
              label="Upcoming Followup"
              value={master.upcomingFollowup}
              onChange={(v) =>
                setMaster((p) => ({ ...p, upcomingFollowup: v }))
              }
            />
            <MasterDataInput
              label="Lead Pool"
              value={master.leadPool}
              onChange={(v) => setMaster((p) => ({ ...p, leadPool: v }))}
            />
            <MasterDataInput
              label="Complaints Type"
              value={master.ComplaintsType}
              onChange={(v) => setMaster((p) => ({ ...p, ComplaintsType: v }))}
            />
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowMasterModal(false)}
              className="border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-slate-200"
            >
              Close
            </button>
            <button
              onClick={handleMasterDataSubmit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Submit"}
            </button>
          </div>
        </ModalShell>
      )}
      {showMasterPermissionModal && (
        <ModalShell
          title="Permission Required"
          onClose={() => setShowMasterPermissionModal(false)}
        >
          <p className="text-sm text-gray-700 dark:text-slate-200">
            You do not have permission to update master data.
          </p>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowMasterPermissionModal(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm"
            >
              OK
            </button>
          </div>
        </ModalShell>
      )}
      {showReminderModal && (
        <ModalShell
          title="Set Reminder"
          onClose={() => setShowReminderModal(false)}
        >
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-slate-200">
            Reminder Date & Time
          </label>
          <input
            type="datetime-local"
            value={reminderDateTime}
            onChange={(e) => {
              setReminderDateTime(e.target.value);
              setReminderError("");
            }}
            className="w-full rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {reminderError && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {reminderError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowReminderModal(false)}
              className="border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-slate-200"
            >
              Close
            </button>
            <button
              onClick={handleReminderSubmit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Reminder"}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

const TabButton = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap ${active ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"}`}
  >
    {children}
  </button>
);
const SectionCard = ({ title, children }) => (
  <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm p-6">
    <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
      {title}
    </h2>
    <div className="mt-4">{children}</div>
  </section>
);
const InfoItem = ({ icon, label, value, copyEnabled = false, onCopy }) => (
  <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 p-3">
    <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
      {label}
    </p>
    <div className="mt-1 text-sm text-gray-700 dark:text-slate-100 flex items-center gap-2 break-all">
      <span className="inline-flex items-center gap-2 min-w-0">
        <span>
          {React.createElement(icon, {
            className: "w-4 h-4 text-gray-400 dark:text-slate-500",
          })}
        </span>
        <span className="break-all">{value || "-"}</span>
      </span>
      {copyEnabled && value ? (
        <button
          type="button"
          onClick={onCopy}
          className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-300 dark:hover:text-blue-300 dark:hover:bg-blue-500/20"
          title={`Copy ${label}`}
        >
          <Copy className="w-4 h-4" />
        </button>
      ) : null}
    </div>
  </div>
);
const ActionCard = ({
  icon,
  title,
  description,
  content,
  actionLabel,
  onClick,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md transition p-5">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 flex items-center justify-center">
        {React.createElement(icon, { className: "w-5 h-5" })}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mt-0.5">
          {description}
        </p>
      </div>
    </div>
    <div className="mt-4">{content}</div>
    <button
      onClick={onClick}
      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm"
    >
      {actionLabel}
    </button>
  </div>
);
const TimelineList = ({ loading, items, compact }) =>
  loading ? (
    <p className="text-sm text-gray-500 dark:text-slate-400">
      Loading timeline...
    </p>
  ) : items.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-slate-400">
      No recent activity.
    </p>
  ) : (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id || `${item.action}-${item.at}`}
          className={`relative ml-2 pl-6 ${compact ? "py-2" : "py-3"}`}
        >
          <span className="absolute left-0 top-0 bottom-0 w-px bg-gray-200 dark:bg-slate-700" />
          <span className="absolute left-[-4px] top-4 w-2.5 h-2.5 rounded-full bg-blue-500" />
          <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                {item.action || "Activity"}
              </p>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {formatTimelineDate(item.at)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">
              {item.details || "-"}
            </p>
            {item.changedBy && (
              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                By {item.changedBy}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
const SeeMore = ({ expanded, onClick }) => (
  <button
    onClick={onClick}
    className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400"
  >
    {expanded ? (
      <>
        See Less <ChevronUp className="w-4 h-4" />
      </>
    ) : (
      <>
        See More <ChevronDown className="w-4 h-4" />
      </>
    )}
  </button>
);
const ModalShell = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-xl p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          {title}
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);
const SelectionModal = ({
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  onSubmit,
  saving,
}) => (
  <ModalShell title={title} onClose={onClose}>
    <div className="mb-5 max-h-64 overflow-y-auto rounded-lg border border-gray-200 dark:border-slate-800">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(option)}
          className={`w-full px-4 py-3 text-left text-sm border-b border-gray-200 dark:border-slate-800 last:border-b-0 flex items-center justify-between ${selectedValue === option ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
        >
          <span>{option}</span>
          {selectedValue === option ? <Check className="w-4 h-4" /> : null}
        </button>
      ))}
    </div>
    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        className="border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-slate-200"
      >
        Close
      </button>
      <button
        onClick={onSubmit}
        disabled={!selectedValue || saving}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
      >
        {saving ? "Saving..." : "Submit"}
      </button>
    </div>
  </ModalShell>
);
const MasterDataInput = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="block mb-1 text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);
const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};
const toDateTimeInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};
const formatTimelineDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
};

export default LeadDetails;
