const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const Post = require('../models/Post');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    file.mimetype.startsWith('image/') ? cb(null, true) : cb(new Error('Only image files are allowed')),
});

// Stream the in-memory buffer to Cloudinary
const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'sprint11' }, (err, result) =>
      err ? reject(err) : resolve(result)
    );
    stream.end(buffer);
  });

router.get('/', async (_req, res, next) => {
  try {
    res.json(await Post.find().sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

router.post('/', upload.single('thumbnail'), async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    let imageUrl = '';
    if (req.file) imageUrl = (await uploadToCloudinary(req.file.buffer)).secure_url;

    res.status(201).json(await Post.create({ title, content, imageUrl }));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Deleted', id: deleted._id });
  } catch (e) { next(e); }
});

module.exports = router;
