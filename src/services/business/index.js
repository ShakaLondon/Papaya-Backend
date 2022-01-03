import express from "express"
import createError from "http-errors"
import { generateJwt, JwtMiddleware } from "../../utils/auth/jwt.js"
import BusinessModel from "./schema.js"
import UploadModel from "../uploads/schema.js"
import ReviewModel from "../reviews/schema.js"
import CategoryModel from "../category/schema.js"
import validations from "../../utils/validation/index.js"
import { adminOnly } from "../../utils/auth/adminOnly.js"
import { businessUserOnly } from "../../utils/auth/businessUserOnly.js"
import captureWebsite from 'capture-website'
import puppeteer from 'puppeteer'
import streamifier from 'streamifier'

import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { storage } from '../../utils/cloudinary.js'
// import { onlyOwner } from "../../utils/auth/onlyOwner.js"

const { CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_NAME,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});



const { businessValidationRules, validate } = validations

const businessRouter = express.Router()

async function takeScreenshot(businessURL) {
// GET WEBSITE SCREENSHOT

const browser = await puppeteer.launch({
  defaultViewport: {
      width: 800,
      height: 500,
      isLandscape: true
  }
});
const page = await browser.newPage();
await page.goto(`https://${businessURL}`, { waitUntil: 'networkidle2' });
const imageBuffer = await page.screenshot({
  encoding: 'binary',
  omitBackground: true
});

console.log(imageBuffer)
await browser.close();

return imageBuffer
}

function uploadScreenshot(screenshot) {
  return new Promise((resolve, reject) => {
    // const uploadOptions = {};
    let cld_upload_stream = cloudinary.uploader.upload_stream({
      folder: 'Papaya'
    }, (error, result) => {
      if (error) reject(error)
      else resolve(result);
    })
    streamifier.createReadStream(screenshot).pipe(cld_upload_stream);
  });


}

// CREATE BUSINESS ✅
businessRouter.post("/",
JwtMiddleware,
businessValidationRules(),
validate,
adminOnly,
async (req, res, next) => {
  try {

    const category = req.body.category

    const website = req.body.website

    console.log(website)

    const catFind = await CategoryModel.findByName(category)



        const newBusiness = await new BusinessModel({...req.body, category: catFind._id}).save()

        // const websiteScreen = await captureWebsite.buffer(req.body.website);

        // console.log(websiteScreen + "website")

        const updateCategory = await new CategoryModel.findByIdAndUpdate( catFind._id, { categoryList: newBusiness._id,
          //  $inc: {categoryListNo: 1} 
          }, {
          new: true, // to use existing record n
          runValidators: true,
        })


        const cloudScreenURL = await takeScreenshot(req.body.website)
        .then((screenshot) => uploadScreenshot(screenshot))
        .then((result) => { console.log(result) 
          return result})


        console.log(cloudScreenURL)
  


        


        const { _id } = await new UploadModel({
          avatar: cloudScreenURL.url,
          cover: "https://res.cloudinary.com/shakalondon/image/upload/v1636930471/default-header.jpg",
          profileID: newBusiness._id,
        }).save();
  
        const updatedBusiness = await BusinessModel.findByIdAndUpdate(newBusiness._id, { avatar: _id }, {
          new: true, // to use existing record n
          runValidators: true,
        })

        await updatedBusiness.populate(['avatar', 'category'])

    res.status(201).send(updatedBusiness)

  } catch (error) {

    if (error.name === "ValidationError") {

      next(createError(400, error))

    } else {

      console.log(error)

      next(createError(500, "An error occurred while creating new business"))
    }
  }
})

// GET ALL BUSINESSES ✅
businessRouter.get("/",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const business = await BusinessModel.find()

    res.send(business)

  } catch (error) {

    next(createError(500, "An error occurred while getting business' list "))

  }
})

// GET BUSINESS BY WEBSITE ✅
businessRouter.get("/:businessWeb",
// JwtMiddleware,
// adminOnly,
async (req, res, next) => {
  try {

    const businessWeb = req.params.businessWeb
    // console.log(businessWeb)

    const business = await BusinessModel.find({ website: businessWeb }).populate([{
      path: 'avatar',
      model: 'Upload',
      // select: 'street zipCode'
        // populate: {
        //   path: 'country',
        // model: 'Country',
        // }
          },
          {
            path: 'category',
            model: 'Category',
            // select: 'street zipCode'
              // populate: {
              //   path: 'country',
              // model: 'Country',
              // }
                },
          {
            path: 'reviewIDs',
            model: 'Reviews',
            // select: 'street zipCode'
              populate: {
                path: 'userID',
              model: 'Users',
               populate: {
                path: 'avatar',
              model: 'Upload',
              },
              },
            
              //   { path: 'avatar',
              // model: 'Upload',
              // }]
            }
           
              // {
              //   path: 'userID',
              //   model: 'User',
              //   // select: 'street zipCode'
              //     populate: {
              //       path: 'avatar',
              //     model: 'Upload',
              //     // populate: {
              //     //   path: 'avatar',
              //     // model: 'Upload',
              //     // }
              //     }}
                ])
                // .populate('categoryItems')

    if (business) {

      
      res.send(business)
    } else {
      next(createError(404, `Business with _id ${businessWeb} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting business"))
  }
})

// DELETE BUSINESS BY ID ✅
businessRouter.delete("/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {
    const businessID = req.params.businessID

    const deletedBusiness = await BusinessModel.findByIdAndDelete(businessID)

    if (deletedBusiness) {
      res.status(204).send()
    } else {
      next(createError(404, `User with _id ${businessID} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting user ${req.params.businessID}`))
  }
})

// EDIT BUSINESS BY ID ✅
businessRouter.put("/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {
    const businessID = req.params.businessID

    const updatedUser = await BusinessModel.findByIdAndUpdate(businessID, req.body, {
      new: true, // to use existing record n
      runValidators: true,
    })

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createError(404, `User with _id ${businessID} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while updating user ${req.params.businessID}`))
  }
})

// GET ALL REVIEWS FOR BUSINESS
businessRouter.get("/:businessWeb/reviews/",

async (req, res, next) => {
  try {

    const businessWeb = req.params.businessWeb

    const business = await BusinessModel.findOne({ website: businessWeb }).populate([{
      path: 'avatar',
      model: 'Upload',
      // select: 'street zipCode'
        // populate: {
        //   path: 'country',
        // model: 'Country',
        // }
          },
          {
            path: 'reviewIDs',
            model: 'Reviews',
            // select: 'street zipCode'
              populate: {
                path: 'userID',
              model: 'Users',
              // populate: {
              //   path: 'avatar',
              // model: 'Upload',
              // }
              }
                }])


                const businessID = business._id
                console.log(business)
                const businessIDString = businessID.toString()
        const businessReviews = await ReviewModel.find({ businessID: businessIDString })

    if (business && businessReviews) {
      console.log(business)

      res.send({
        business: business,
        reviews: businessReviews
      })

    } else {
      next(createError(404, `User with _id ${businessID} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting user"))
  }
})

// GET ALL REVIEWS FOR BUSINESS
businessRouter.get("/:businessWeb/reviews/averages",

async (req, res, next) => {
  try {

    const businessWeb = req.params.businessWeb

    const business = await BusinessModel.findOne({ website: businessWeb })
    // .populate([{
    //   path: 'avatar',
    //   model: 'Upload',
    //   // select: 'street zipCode'
    //     // populate: {
    //     //   path: 'country',
    //     // model: 'Country',
    //     // }
    //       },
    //       {
    //         path: 'reviewIDs',
    //         model: 'Reviews',
    //         // select: 'street zipCode'
    //           populate: {
    //             path: 'userID',
    //           model: 'Users',
    //           // populate: {
    //           //   path: 'avatar',
    //           // model: 'Upload',
    //           // }
    //           }
    //             }])


                const businessID = business._id

                console.log(business)

                const businessIDString = businessID.toString()

        const businessResults = await ReviewModel.aggregate(
          [
            { $match: { "businessID": businessID } },
            {
              $group: {
                "_id": null,
                // totalReviews: {
                  count: { $sum: 1 }, 
                // },
                totalScore: {
                  $sum: "$rating"
                },
                average: {
                  $avg: "$rating"
                }
              }
            },
            // {
            //   $group: {
            //     "_id": "rating",
            //     // totalReviews: {
            //       count: { $sum: 1 }, 
            //     // },
            //     "rating": {
            //       $sum: "$rating"
            //     },
            //     // average: {
            //     //   $avg: "$rating"
            //     // }
            //   }
            // }
          ],
          // function(err, result) {
            // if (err) {
            //   res.send(err);
            // } else {
            //   return(result);
            // }
          //   return result
          // }
        );

        console.log(businessResults)

        const businessResultNo = await ReviewModel.aggregate(
          [
            { $match: { "businessID": businessID }  },
            // {
            //   $count: "$_id"
            // },
            {
              $group: {
                _id: "$rating",
                // totalReviews: {
                  count: { $sum: 1 },
                  // percentage: { $divide: },
                  "reviews" : {$push : "$_id"}
                // }
              }
            },
            {
              $lookup: {
                "from": "reviews",
                "localField": "reviews",
                "foreignField": "_id",
                "as": "reviews"
              }
            }
          ],
          // function(err, result) {
          //   if (err) {
          //     res.send(err);
          //   } else {
          //     return(result);
          //   }
          // }
        );

        console.log(businessResultNo)
      

    if (businessResultNo && businessResults) {
      // console.log(business)

      res.send({
        avgTotal: businessResults,
        reviewNo: businessResultNo
      })

    } else {
      next(createError(404, `User with _id ${businessID} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting user"))
  }
})

export default businessRouter
