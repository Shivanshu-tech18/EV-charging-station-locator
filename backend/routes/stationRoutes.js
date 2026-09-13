import express from 'express';
import {
  getStations,
  getStationById,
  checkAvailability,
  createStation,
  updateStation,
  deleteStation,
} from '../controllers/stationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getStations);
router.post('/check-availability', checkAvailability);
router.get('/:id', getStationById);

// Admin-only station management routes
router.post('/', protect, admin, createStation);
router.put('/:id', protect, admin, updateStation);
router.delete('/:id', protect, admin, deleteStation);

export default router;
