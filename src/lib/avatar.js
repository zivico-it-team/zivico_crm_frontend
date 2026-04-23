import { API_ORIGIN } from "./api";

const toAbsoluteUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `${API_ORIGIN}${value.startsWith("/") ? "" : "/"}${value}`;
};

const pickImagePath = (entity = {}) =>
  entity?.profilePicture ||
  entity?.profileImageUrl ||
  entity?.avatar ||
  entity?.image ||
  entity?.photo ||
  "";

const pickImageVersion = (entity = {}) =>
  entity?.profileImageVersion ||
  entity?.updatedAt ||
  entity?.profileImageFileName ||
  "";

export const buildAvatarUrl = (entity = {}) => {
  const imagePath = pickImagePath(entity);
  if (!imagePath) return "";

  const absoluteUrl = toAbsoluteUrl(imagePath);
  const version = pickImageVersion(entity);

  if (!version) return absoluteUrl;
  return `${absoluteUrl}${absoluteUrl.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
};

