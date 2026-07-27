// ============================================================
// File: server/routes/products.js
// ============================================================

const express            = require('express');
const router             = express.Router();
const ProductController  = require('../controllers/ProductController');
const { authMiddleware } = require('../middleware/auth');
const { upload }         = require('../config/cloudinary');

// Error handler khusus multer (ukuran file / format tidak valid)
function handleUploadError(err, req, res, next) {
  if (err && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'Ukuran file terlalu besar. Maksimal 2MB.' });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Gagal upload gambar' });
  }
  next();
}

// Semua route produk butuh login
router.use(authMiddleware);

// GET    /api/products           → daftar produk
router.get('/', ProductController.index);

// POST   /api/products           → simpan produk baru (opsional upload image)
router.post('/',
  upload.single('image'),  // field name "image" di form
  handleUploadError,
  ProductController.store
);

// GET    /api/products/:id       → detail produk
router.get('/:id', ProductController.show);

// PUT    /api/products/:id       → update produk (opsional upload image baru)
router.put('/:id',
  upload.single('image'),
  handleUploadError,
  ProductController.update
);

// DELETE /api/products/:id       → hapus produk
router.delete('/:id', ProductController.destroy);

module.exports = router;
