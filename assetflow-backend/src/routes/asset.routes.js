const express = require('express');
const router = express.Router();
const { getAssets, getAssetById, createAsset, updateAsset, deleteAsset, searchAssets, getAssetHistory, getAssetByQr } = require('../controllers/asset.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { assetValidator, updateAssetValidator } = require('../validators/asset.validator');
const { ROLES } = require('../config/constants');

router.use(protect);
router.get('/search', searchAssets);
router.get('/qr/:assetTag', getAssetByQr);
router.get('/history/:id', getAssetHistory);
router.get('/', getAssets);
router.get('/:id', getAssetById);
router.post('/', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(assetValidator), createAsset);
router.put('/:id', authorize(ROLES.ADMIN, ROLES.ASSET_MANAGER), validate(updateAssetValidator), updateAsset);
router.delete('/:id', authorize(ROLES.ADMIN), deleteAsset);

module.exports = router;
