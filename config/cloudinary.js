// ============================================================
// File: server/config/cloudinary.js
// Konfigurasi Cloudinary + middleware multer upload
// ============================================================

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Konfigurasi Cloudinary menggunakan env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage: upload langsung ke Cloudinary folder "products"
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'products',           // folder di Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }], // resize max 800x800
  },
});

// Middleware multer – max 2MB per file
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'));
    }
  },
});

module.exports = { cloudinary, upload };
