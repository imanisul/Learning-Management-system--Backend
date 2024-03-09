import app from './app.js'
import connectDB from './config/dbConnect.js';
import cloudinary from 'cloudinary';
import Razorpay from 'razorpay';


const PORT = process.env.PORT || 4300 ;

//cloudiary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

//razorpay config

export const  razorpay= new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.listen(PORT, async(req, res) => {
      await connectDB()
    console.log(`Server is running on port ${PORT}`);
});
