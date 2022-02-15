import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { config, uploader } from "cloudinary";

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

// const cloudinaryConfig = () => config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
//   });

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "Papaya",
      public_id: file.fieldname + "-" + req.user._id + "-" + req.user.username,
    };
  },
});

// export const coverStorage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (req,file) => {
//     return {
//       folder: 'Papaya',
//       public_id: file.fieldname + '-' + req.user._id + '-' + req.user.username
//     }
//   }
// });
