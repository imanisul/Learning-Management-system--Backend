import {Router} from 'express';
import { allPayments, buySubscription, cancelSubscription, getRazorpayKey, verifySubscription } from '../controllers/paymentController.js';
import { authorizedRole, isLoggedIn } from '../middlewares/authMiddleware.js';

const router = Router();

router.route('/razorpay-key')
.get(isLoggedIn,getRazorpayKey);

router.route('/subscribe')
.post(isLoggedIn,buySubscription);

router.route('/verify')
.post(isLoggedIn,verifySubscription);

router.route('/unsubscribe')
.post(isLoggedIn,cancelSubscription);

router.route('/')
.get(isLoggedIn,authorizedRole('ADMIN'),allPayments);

export default router;