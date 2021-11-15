// import multer from 'multer'
// import path from 'path'
// import { storage } from './cloudinary'
// import cloudinary from '../utils/cloudinary.js'
// Multer config


// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// }); 

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "DEV",
//   },
// });

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './resources/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, req.user._id + '-' + req.user.username)
//   }
// })


// const storage = multer.memoryStorage();

// const multerUploads = multer({ 
//   storage: storage,
//   // fileFilter: (req, file, cb) => {
//   //   console.log(file)
//   //   let ext = path.extname(file.originalname);
//   //     if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
//   //     cb(new Error("File type is not supported"), false);
//   //     return;
//   //   }
//   //   cb(null, true);
//   // },
//  }).array('image');

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     console.log(file)
//     let ext = path.extname(file.originalname);
//       if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
//       cb(new Error("File type is not supported"), false);
//       return;
//     }
//     cb(null, true);
//   },
// });

// export { multerUploads }