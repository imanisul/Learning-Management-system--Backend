import { Router } from 'express';
import { contactUs, userStats } from '../controllers/contactController.js';
import { authorizedRole, isLoggedIn } from '../middlewares/authMiddleware.js';

const router = Router();

router.route('/contact').post(contactUs);
router
  .route('/admin/stats/users')
  .get(isLoggedIn, authorizedRole('ADMIN'), userStats);

export default router;