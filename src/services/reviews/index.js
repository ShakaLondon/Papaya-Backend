import express from "express"
import createError from "http-errors"
import ReviewModel from "./schema.js"
import UserModel from "../users/schema.js"
import BusinessModel from "../business/schema.js"
import validations from "../../utils/validation/index.js"
import { adminOnly } from "../../utils/auth/adminOnly.js"
import { JwtMiddleware } from "../../utils/auth/jwt.js"

const { reviewValidationRules, validate } = validations

const reviewRouter = express.Router()

// CREATE REVIEW ✅
reviewRouter.post("/",
JwtMiddleware,
reviewValidationRules(),
validate,
adminOnly,
async (req, res, next) => {
  try {
    const newReview = new ReviewModel(req.body)
    const { _id, businessID, userID } = await newReview.save()
    console.log(userID)

    const business = await BusinessModel.findByIdAndUpdate(businessID, { $push: { reviewIDs: _id } },
      { new: true, 
        runValidators: true }
  )

  const user = await UserModel.findByIdAndUpdate(userID, { $push: { reviews: _id } },
    { new: true, 
      runValidators: true }
)

    res.status(201).send({ _id })

  } catch (error) {

    if (error.name === "ValidationError") {

      next(createError(400, error))

    } else {

      console.log(error)

      next(createError(500, "An error occurred while creating new author"))
    }
  }
})

// GET ALL REVIEWS ✅
reviewRouter.get("/",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const reviews = await ReviewModel.find()

    res.send(reviews)

  } catch (error) {

    next(createError(500, "An error occurred while getting blogs' list "))

  }
})

// GET SINGLE REVIEW
reviewRouter.get("/:reviewID",
JwtMiddleware,
adminOnly, 
async (req, res, next) => {
  try {

    const reviewID = req.params.reviewID

    const review = await ReviewModel.findById(reviewID)

    if (review) {
      res.send(review)
    } else {
      next(createError(404, `Blog with _id ${reviewID} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting blog"))
  }
})

// DELETE SINGLE REVIEW ✅
reviewRouter.delete("/:reviewID",
JwtMiddleware,
adminOnly, 
async (req, res, next) => {
  try {
    const reviewID = req.params.reviewID

    const { _id, userID } = await ReviewModel.findById(reviewID)

    const business = await BusinessModel.findByIdAndUpdate(_id, { $pull: { reviewIDs: reviewID } },
      { new: true, 
        runValidators: true }
  )

  const user = await UserModel.findByIdAndUpdate(userID, { $pull: { reviews: reviewID } },
    { new: true, 
      runValidators: true }
)

  const deletedReview = await ReviewModel.findByIdAndDelete(reviewID)

    if (deletedReview) {
      res.status(204).send()
    } else {
      next(createError(404, `Blog with _id ${reviewID} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting blog ${req.params.reviewID}`))
  }
})

// EDIT SINGLE REVIEW ✅
reviewRouter.put("/:reviewID",
JwtMiddleware,
adminOnly, 
async (req, res, next) => {
  try {
    const reviewID = req.params.reviewID

    const updatedReview = await ReviewModel.findByIdAndUpdate(reviewID, req.body, {
      new: true,
      runValidators: true,
    })

    if (updatedReview) {
      res.send(updatedReview)
    } else {
      next(createError(404, `Blog with _id ${reviewID} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while updating blog ${req.params.reviewID}`))
  }
})

export default reviewRouter


// await MyModel.find({ name: /john/i }, 'name friends').exec();