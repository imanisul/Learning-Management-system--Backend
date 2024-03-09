import mongoose  from "mongoose";

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description field cannot be empty'],
    },
    category: {
        type: String,
        required: [true, 'Category of the course is required'],
    },
    thumbnail: {
        public_id: {
            type: String,
            required: true

        }, 
        secure_url: {
            type: String,
            required: true
        },
    },  
    lectures: [
        {
            title: String,
            description: String,
            lecture: {
                public_id: {
                    type: String,
                    required: true

                }, 
                secure_url: {
                    type: String,
                    required: true
                },
            }
        }
    ],
    numberofLecture: {
        type:Number,
        default: 0,
    },
    createdBy: {
        type: String,
        required: true
    }

},{timestamps: true
});

export const Course = mongoose.model('Course', courseSchema);
