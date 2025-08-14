const express = require('express');
const { upload } = require('../config/cloudinary');

const router = express.Router();

// Upload single image
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // With CloudinaryStorage, req.file.path contains the Cloudinary URL
    res.json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename, // Cloudinary public ID
      width: req.file.width,
      height: req.file.height
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Image upload failed',
      details: error.message 
    });
  }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { cloudinary } = require('../config/cloudinary');
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ success: true, message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ error: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router;
