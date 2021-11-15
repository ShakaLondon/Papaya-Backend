import express from "express"
import multer from "multer"
import { JwtMiddleware } from "../../utils/auth/jwt.js"
// import { multerUploads } from "../../utils/multer.js"
import UploadModel from "../uploads/schema.js"
import UserModel from "../users/schema.js"
import { storage } from '../../utils/cloudinary.js'


const imageRouter = express.Router()

const parseFile = multer({storage});
// const parseCover = multer({coverStorage});

// UPLOADIMAGE ✅
imageRouter.post('/upload/avatar',
JwtMiddleware,
parseFile.single("avatar"),
async (req, res, next) => {

  try {
    
    // Upload image to cloudinary
    // const result = await cloudinary.uploader.upload(req.image.path);
    //  // Create new user

     console.log(req.user + "here")

     const user = req.user

    //  const newUpload = await new UploadModel({
    //   avatar: result.secure_url,
    //   cloudinary_ID: result.public_id,
    //   userID: user._id,
    // }).save();

    // console.log(newUpload)

     const updatedUser = await UploadModel.findByIdAndUpdate(user.avatar, {
        avatar: req.file.path,
        // cloudinary_ID: result.public_id,
        // userID: user._id,
      }, {
      new: true, // to use existing record n
      runValidators: true,
    })


    const userNew = await UserModel.findById(req.user._id)

    await userNew.populate(['reviews', 'avatar'])

    console.log(userNew)


    res.status(200).send(userNew);
  } catch (err) {
    next(err)
  }

})


// UPLOADCOVER ✅
imageRouter.post('/upload/cover',
JwtMiddleware,
parseFile.single("cover"),
async (req, res, next) => {

  try {
    
    // Upload image to cloudinary
    // const result = await cloudinary.uploader.upload(req.image.path);
    //  // Create new user

     console.log(req.user + "here")

     const user = req.user

    //  console.log(req.file.path)

    //  const newUpload = await new UploadModel({
    //   avatar: result.secure_url,
    //   cloudinary_ID: result.public_id,
    //   userID: user._id,
    // }).save();

    // console.log(newUpload)

     const updatedUser = await UploadModel.findByIdAndUpdate(user.avatar, {
        cover: req.file.path,
        // cloudinary_ID: result.public_id,
        // userID: user._id,
      }, {
      new: true, // to use existing record n
      runValidators: true,
    })

    const userNew = await UserModel.findById(req.user._id)

    await userNew.populate(['reviews', 'avatar'])

    res.status(200).send(userNew);
  } catch (err) {
    next(err)
  }

})



export default imageRouter
