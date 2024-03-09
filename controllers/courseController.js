import { Course } from "../models/courseModel.js"
import AppError from "../utlis/errorUtils.js";
import fs from 'fs/promises';
import cloudinary from 'cloudinary';

const getAllCourse = async (req, res, next) => {
    try {
        const courses = await Course.find({}).select('-lectures');

    res.status(200).json({
        success: true,
        message: "All courses",
        courses,
    })
    } catch (error) {
        return next(new AppError('Unable to display course', 400 || error))
    }
}

const getLectureByCourseId = async (req, res, next) => {

     try {
        const {id} = req.params;
        const course = await Course.findById(id);

        if(!course){
            return next(new AppError('Invalid Course Id', 400));
        }
  
        res.status(200).json({
          success: true,
          message: 'Course Lecture fetched successfully!',
          lectures: course.lectures,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
     }

};

const createCourse = async(req, res, next) => {
    try {
        const {title, description, category, createdBy} = req.body;

    if(!title || !description || !category || !createdBy ) {
        return next(new AppError("All fields are required!", 400));
    }
    const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
            public_id: 'dumy',
            secure_url:' https://cloudinary-res.cloudinary.com/image/upload/website/cloudinary_web_favicon.png'
         }
    });

    if(!course){
        return next (new AppError("Course couldn't be created please try again!", 500))
    }

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder: 'lms',
    
            });
            if(result){
                course.thumbnail.public_id = result.public_id;
                course.thumbnail.secure_url = result.secure_url;
    
                //remove file from server
               fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (error) {
            return next(new AppError(error || 'Unable to upload file, please try again!', 500))
        }
       }
       await course.save();

       res.status(200).json({
        message: "Course has been created successfully!",
        success: true,
        course
       });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const updateCourse = async(req, res, next) => {
    try {
        const {id} = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set: req.body
            },
            {
               runValidators: true
            }
        );
        if(!course){
            return next (new AppError("Course with given id doesn't exist", 400));
        };


        res.status(200).json({
            message: 'Course Updated Successfully!',
            success: true,
            course
        });
    } catch (error) {
        return next (new AppError(error.message, 500))
    }
};

const removeCourse = async (req, res, next) => {
        try {
            const {id} = req.params;
            const course = await Course.findById(id);

            if(!course){
                return next (new AppError("Course with given id doesn't exist", 400));
            };

            await Course.findByIdAndDelete(id);
            res.status(200).json({
                message: "Course Deleted Successfully!",
                success: true
            })
        } catch (error) {
            return next(new AppError(error.message, 500));
        }
};

const addLectureToCourseById = async (req, res, next) => {
      try {
        const {title, description } = req.body;
        const {id} = req.params;

      if(!title || !description) {
        return next(new AppError("All fields are required!", 400));
    }

      const course = await Course.findById(id);

      if(!course){
        return next (new AppError("Course with given id doesn't exist", 400));
    };

    const lecturedata = {
        title,
        description,
        lecture: {}
    };

    if(req.file){
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path,{
                folder: 'lms',
    
            });
            if(result){
                lecturedata.lecture.public_id = result.public_id;
                lecturedata.lecture.secure_url = result.secure_url;
    
                //remove file from server
               fs.rm(`uploads/${req.file.filename}`);
            }
        } catch (error) {
            return next(new AppError(error || 'Unable to upload file, please try again!', 500))
        }
    }

    course.lectures.push(lecturedata);

    course.numberofLecture = course.lectures.length;

    await course.save();

    res.status(200).json({
        message: 'Lecture uploaded Successfully!',
        success: true,
        course
    })
      } catch (error) {
        return next (new AppError(error.message, 500));
      }

};

const deleteLecture = async (req, res, next) => {
    const { courseId, lectureId } = req.query;

    console.log(courseId);
  
    if (!courseId) {
      return next(new AppError('Course ID is required', 400));
    }
  
    if (!lectureId) {
      return next(new AppError('Lecture ID is required', 400));
    }
  
    const course = await Course.findById(courseId);
  
    if (!course) {
      return next(new AppError('Invalid ID or Course does not exist.', 404));
    }

  const lectureIndex = course.lectures.findIndex(
    (lecture) => lecture._id.toString() === lectureId.toString()
  );

  if (lectureIndex === -1) {
    return next(new AppError('Lecture does not exist.', 404));
  }

  // Delete the lecture from cloudinary
  await cloudinary.v2.uploader.destroy(
    course.lectures[lectureIndex].lecture.public_id,
    {
      resource_type: 'video',
    }
  );
  // Remove the lecture from the array
  course.lectures.splice(lectureIndex, 1);

  // update the number of lectures based on lectres array length
  course.numberofLecture = course.lectures.length;

  await course.save();

  res.status(200).json({
    success: true,
    message: 'Lecture deleted successfully',
  });
};

export  {
    getAllCourse,
    getLectureByCourseId,
    createCourse,
    updateCourse,
    removeCourse,
    addLectureToCourseById,
    deleteLecture,
}