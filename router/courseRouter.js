import {Router } from 'express';
import { addLectureToCourseById, createCourse, deleteLecture, getAllCourse, getLectureByCourseId, removeCourse, updateCourse } from '../controllers/courseController.js';
import {authorizedRole, authorizedsubscriber, isLoggedIn }from '../middlewares/authMiddleware.js';
import upload from '../middlewares/multermiddleware.js';

const router = new Router();

router.route('/').get( getAllCourse)
    .post(isLoggedIn,authorizedRole('ADMIN'),upload.single('thumbnail'),createCourse)
    

router.route('/:id').get(isLoggedIn, authorizedsubscriber,getLectureByCourseId)
    .put(isLoggedIn, authorizedRole('ADMIN'),updateCourse)
    .delete(isLoggedIn, authorizedRole('ADMIN'),removeCourse)
    .post(isLoggedIn, authorizedRole('ADMIN'),upload.single('lecture'), addLectureToCourseById)
    .delete(isLoggedIn, authorizedRole('ADMIN'), deleteLecture);

export default router;