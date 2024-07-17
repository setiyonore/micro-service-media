const express = require('express');
const router = express.Router();
const isBase64 = require('is-base64');
const base64Img = require('base64-img');
const { Media } = require('../models');
router.get('/', async (req, res) => {
  const media = await Media.findAll({
    attributes: ['id', 'image'],
  });
  const mappedMedia = media.map((m) => {
    m.image = `${req.protocol}://${req.get('host')}/${m.image}`
    return m;
  });
  return res.json({
    status: 'success',
    data: mappedMedia,
  });
});
router.post('/', (req, res) => {
  const image = req.body.image;
  if (!isBase64(image, { mimeRequired: true })) {
    return res.status(400).json({ status: 'error', message: 'invalid base64' });
  }
  base64Img.img(image, './public/images', Date.now(), async (err, filepath) => {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }
    const filename = filepath.split('/').pop();

    try {
      const media = await Media.create({ image: `images/${filename}` });
      return res.json({
        status: 'success',
        data: {
          id: media.id,
          image: `${req.protocol}://${req.get('host')}/images/${filename}`
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }


  })
});

module.exports = router;
