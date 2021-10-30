import express from "express"
import createError from "http-errors"
import { generateJwt, JwtMiddleware } from "../../utils/auth/jwt.js"
import BusinessModel from "./schema.js"
import ReviewModel from "../reviews/schema.js"
import { businessValidationRules, validate } from "../../utils/validation/index.js"
import { adminOnly } from "../../utils/auth/adminOnly.js"
import { businessUserOnly } from "../../utils/auth/businessUserOnly.js"
// import { onlyOwner } from "../../utils/auth/onlyOwner.js"


const businessRouter = express.Router()

// CREATE BUSINESS
businessRouter.post("/",
JwtMiddleware,
businessValidationRules(),
validate,
adminOnly,
async (req, res, next) => {
  try {

    const newBusiness = new BusinessModel(req.body)
    const { _id } = await newBusiness.save()

    res.status(201).send({ _id })

  } catch (error) {

    if (error.name === "ValidationError") {

      next(createError(400, error))

    } else {

      console.log(error)

      next(createError(500, "An error occurred while creating new business"))
    }
  }
})

// GET ALL BUSINESSES
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

// GET BUSINESS BY ID
businessRouter.get("/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const businessID = req.params.businessID

    const business = await UserModel.findById(businessID)

    if (business) {
      res.send(business)
    } else {
      next(createError(404, `Business with _id ${businessID} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting business"))
  }
})

// DELETE BUSINESS BY ID
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

// EDIT BUSINESS BY ID
businessRouter.put("/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {
    const businessID = req.params.businessID

    const updatedUser = await UserModel.findByIdAndUpdate(businessID, req.body, {
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

// GET ALL BUSINESS BY USER
businessRouter.get("/:businessID/reviews/",
JwtMiddleware,
async (req, res, next) => {
  try {

    const businessID = req.params.businessID

    console.log(businessID)

    const businessSearch = String(businessID)

    console.log(businessSearch)

    const reviewsByUser = await ReviewModel.find({ businessID: { $in: userSearch }}, 
    function(err, result) {
      if (err) {
        res.send(err);
      }
      })

    if (reviewsByUser) {
      console.log(reviewsByUser)
      res.send(reviewsByUser)
    } else {
      next(createError(404, `User with _id ${businessID} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting user"))
  }
})

export default businessRouter
