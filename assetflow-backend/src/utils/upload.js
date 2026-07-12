const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload subdirectories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route uploads to sub-folders by context
    let folder = 'uploads/misc';
    if (req.uploadContext === 'avatar') folder = 'uploads/avatars';
    else if (req.uploadContext === 'maintenance') folder = 'uploads/maintenance';
    else if (req.uploadContext === 'asset') folder = 'uploads/assets';
    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${safeName}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
};

const documentFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only images and PDFs are allowed'));
};

// Single avatar upload (profile)
const avatarUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

// Up to 5 photos for maintenance requests
const maintenanceUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5 MB each, max 5
});

// Up to 10 files (images + PDFs) for asset documents
const assetDocUpload = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 }, // 10 MB each, max 10
});

// Middleware to tag the upload context so destination can route correctly
const setContext = (context) => (req, res, next) => {
  req.uploadContext = context;
  next();
};

module.exports = {
  // Legacy default export (single file, any doc — keeps existing profile route working)
  single: (field) => avatarUpload.single(field),

  avatar: {
    middleware: setContext('avatar'),
    upload: avatarUpload.single('avatar'),
  },
  maintenance: {
    middleware: setContext('maintenance'),
    upload: maintenanceUpload.array('photos', 5),
  },
  asset: {
    middleware: setContext('asset'),
    upload: assetDocUpload.array('files', 10),
  },
};
