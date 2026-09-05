const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const uploadDir = path.join(__dirname, "../uploads");
const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const createMediaStorage = (folder) => {
  if (cloudinaryConfigured) {
    return new CloudinaryStorage({
      cloudinary,
      params: async (req, file) => ({
        folder: `minesight/${folder}`,
        resource_type: file.mimetype.startsWith("audio/") ? "video" : "image",
      }),
    });
  }

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  return multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const extension =
        path.extname(file.originalname).toLowerCase() ||
        (file.mimetype.startsWith("audio/") ? ".webm" : ".jpg");
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    },
  });
};

const getStoredMediaPath = (file) =>
  cloudinaryConfigured ? file.path : `/uploads/${file.filename}`;

const localUploadPrefix = "/uploads/";

const isRemoteMediaPath = (mediaPath) =>
  typeof mediaPath === "string" && /^https?:\/\//i.test(mediaPath);

const getUploadFilePath = (mediaPath) => {
  if (
    typeof mediaPath !== "string" ||
    !mediaPath.startsWith(localUploadPrefix)
  ) {
    return null;
  }

  let relativePath = mediaPath.slice(localUploadPrefix.length).split(/[?#]/)[0];
  try {
    relativePath = decodeURIComponent(relativePath);
  } catch (error) {
    return null;
  }

  const resolvedPath = path.resolve(uploadDir, relativePath);
  const resolvedUploadDir = path.resolve(uploadDir);

  if (
    resolvedPath !== resolvedUploadDir &&
    resolvedPath.startsWith(`${resolvedUploadDir}${path.sep}`)
  ) {
    return resolvedPath;
  }

  return null;
};

const isAvailableMediaPath = (mediaPath) => {
  if (!mediaPath || typeof mediaPath !== "string") return false;
  if (isRemoteMediaPath(mediaPath)) return true;

  const uploadFilePath = getUploadFilePath(mediaPath);
  return uploadFilePath ? fs.existsSync(uploadFilePath) : true;
};

const serializeInspectionMedia = (inspection) => {
  if (!inspection) return inspection;

  const data =
    typeof inspection.toObject === "function"
      ? inspection.toObject()
      : { ...inspection };

  return {
    ...data,
    photos: (data.photos || []).filter(isAvailableMediaPath),
    audio: isAvailableMediaPath(data.audio) ? data.audio : null,
  };
};

module.exports = {
  createMediaStorage,
  getStoredMediaPath,
  cloudinaryConfigured,
  isAvailableMediaPath,
  serializeInspectionMedia,
};
