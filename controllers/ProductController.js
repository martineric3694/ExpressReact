// ============================================================
// File: server/controllers/ProductController.js
// ============================================================

const Product    = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');

const ProductController = {
  // ----------------------------------------------------------------
  // GET /api/products  → daftar semua produk
  // ----------------------------------------------------------------
  async index(req, res) {
    try {
      const products = await Product.findAll();
      res.json({ products });
    } catch (err) {
      console.error('Product index error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // ----------------------------------------------------------------
  // GET /api/products/:id  → detail produk
  // ----------------------------------------------------------------
  async show(req, res) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
      }
      res.json({ product });
    } catch (err) {
      console.error('Product show error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // ----------------------------------------------------------------
  // POST /api/products  → simpan produk baru (dengan opsional image)
  // Menerima multipart/form-data karena ada file upload
  // ----------------------------------------------------------------
  async store(req, res) {
    const { name, description, price, stock } = req.body;

    if (!name || !price) {
      // Jika ada file yang sudah terlanjur upload ke Cloudinary, hapus lagi
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }
      return res.status(400).json({ message: 'Nama dan harga wajib diisi' });
    }

    try {
      // req.file.path = URL Cloudinary yang sudah di-upload oleh multer-storage-cloudinary
      const image_url = req.file ? req.file.path : null;

      const id = await Product.create({
        name,
        description: description || '',
        price:       parseFloat(price),
        stock:       parseInt(stock, 10) || 0,
        image_url,
        user_id:     req.user.id
      });

      const product = await Product.findById(id);
      res.status(201).json({ message: 'Produk berhasil ditambahkan', product });
    } catch (err) {
      console.error('Product store error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // ----------------------------------------------------------------
  // PUT /api/products/:id  → update produk (dengan opsional image baru)
  // ----------------------------------------------------------------
  async update(req, res) {
    const { name, description, price, stock } = req.body;

    if (!name || !price) {
      if (req.file?.filename) {
        await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
      }
      return res.status(400).json({ message: 'Nama dan harga wajib diisi' });
    }

    try {
      const existing = await Product.findById(req.params.id);
      if (!existing) {
        if (req.file?.filename) {
          await cloudinary.uploader.destroy(req.file.filename).catch(() => {});
        }
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
      }

      // Jika ada gambar baru dikirim, hapus gambar lama dari Cloudinary
      let image_url = undefined; // undefined = tidak ubah gambar
      if (req.file) {
        image_url = req.file.path;
        // Hapus gambar lama dari Cloudinary jika ada
        if (existing.image_url) {
          const publicId = extractPublicId(existing.image_url);
          if (publicId) {
            await cloudinary.uploader.destroy(publicId).catch(() => {});
          }
        }
      }

      await Product.update(req.params.id, {
        name,
        description: description || '',
        price:  parseFloat(price),
        stock:  parseInt(stock, 10) || 0,
        image_url
      });

      const updated = await Product.findById(req.params.id);
      res.json({ message: 'Produk berhasil diupdate', product: updated });
    } catch (err) {
      console.error('Product update error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  },

  // ----------------------------------------------------------------
  // DELETE /api/products/:id  → hapus produk + gambar di Cloudinary
  // ----------------------------------------------------------------
  async destroy(req, res) {
    try {
      const existing = await Product.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({ message: 'Produk tidak ditemukan' });
      }

      // Hapus gambar dari Cloudinary jika ada
      if (existing.image_url) {
        const publicId = extractPublicId(existing.image_url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId).catch(() => {});
        }
      }

      await Product.delete(req.params.id);
      res.json({ message: 'Produk berhasil dihapus' });
    } catch (err) {
      console.error('Product destroy error:', err);
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
  }
};

/**
 * Ekstrak public_id dari Cloudinary URL
 * Contoh URL: https://res.cloudinary.com/demo/image/upload/v12345/products/abc123.jpg
 * Contoh public_id: products/abc123
 */
function extractPublicId(url) {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    // Lewati versi (v12345) jika ada
    const afterUpload = parts.slice(uploadIndex + 1);
    const withoutVersion = afterUpload[0].startsWith('v') && /^\d+$/.test(afterUpload[0].slice(1))
      ? afterUpload.slice(1)
      : afterUpload;
    // Hapus ekstensi file
    const lastPart = withoutVersion[withoutVersion.length - 1].replace(/\.[^/.]+$/, '');
    withoutVersion[withoutVersion.length - 1] = lastPart;
    return withoutVersion.join('/');
  } catch {
    return null;
  }
}

module.exports = ProductController;
