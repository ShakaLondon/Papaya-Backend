import express from "express"
import createError from "http-errors"
import { generateJwt, JwtMiddleware } from "../../utils/auth/jwt.js"
import BusinessUserModel from "./schema.js"
import ReviewModel from "../reviews/schema.js"
import { userBusinessValidationRules, validate } from "../../utils/validation/index.js"
import { adminOnly } from "../../utils/auth/adminOnly.js"
// import { onlyOwner } from "../../utils/auth/onlyOwner.js"


const businessUserRouter = express.Router()

// BUSINESS USER LOGIN
businessUserRouter.post('/business/login', async (req, res, next) => {

  try {
      const { email, password } = req.body

      if (!email || !password) {
          const error = new Error("Missing credentials.")
          error.status = 400

          throw error
      }

      const user = await UserModel.findByCredentials(email, password)

      console.log(user)

      if (!user) {
          const error = new Error("No email/password match.")
          error.status = 400

          throw error
      }

      const token = await generateJwt({ id: user._id })

      res.status(200).send({ token })
  } catch (error) {
      next(error)
  }

})

// BUSINESS USER REGISTER
businessUserRouter.post("/business/register", 
userBusinessValidationRules(),
validate,
async (req, res, next) => {
  try {
      const user = await new BusinessUserModel(req.body).save();
      delete user._doc.password

      const token = await generateJwt({ id: user._id })

      res.send({ user, token })
  } catch (error) {
      console.log({ error });
      res.send(500).send({ message: error.message });
  }
});

// BUSINESS USER GET REVIEWS FOR BUSINESS
businessUserRouter.get('/business/reviews',
JwtMiddleware,
async (req, res, next) => {

  try {
    const reviews = await ReviewModel.find({ userID: req.user._id.toString() })

    res.status(200).send(reviews)

  } catch (error) {
    next(error)
  }

})

// BUSINESS USER EDIT REVIEWS TO ADD RESPONSE
businessUserRouter.put('/business/reviews/:reviewID',
JwtMiddleware,
async (req, res, next) => {

  try {

  const reviewID = req.params.reviewID

  const updatedReview = await ReviewModel.findByIdAndUpdate(reviewID, req.body, {
    new: true, // to use existing record n
    runValidators: true,
  })

  if (updatedUser) {
    res.send(updatedUser)
  } else {
    next(createError(404, `User with _id ${userId} not found!`))
  }
} catch (error) {
  next(createError(500, `An error occurred while updating user ${req.params.userId}`))
}

})



// CREATE BUSINESS USER
businessUserRouter.post("/business",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const newUser = new UserModel(req.body)
    const { _id } = await newUser.save()

    res.status(201).send({ _id })

  } catch (error) {

    if (error.name === "ValidationError") {

      next(createError(400, error))

    } else {

      console.log(error)

      next(createError(500, "An error occurred while creating new blog"))
    }
  }
})

// GET ALL BUSINESS USERS
businessUserRouter.get("/business",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const users = await UserModel.find()

    res.send(users)

  } catch (error) {

    next(createError(500, "An error occurred while getting users' list "))

  }
})

// GET BUSINESS BY ID
businessUserRouter.get("/business/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const userId = req.params.userId

    const user = await UserModel.findById(userId)

    if (user) {
      res.send(user)
    } else {
      next(createError(404, `User with _id ${userId} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting user"))
  }
})

// DELETE USER BY ID
businessUserRouter.delete("/business/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {
    const userId = req.params.userId

    const deletedUser = await UserModel.findByIdAndDelete(userId)

    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `User with _id ${userId} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting user ${req.params.userId}`))
  }
})

// EDIT BUSINESS BY ID
businessUserRouter.put("/business/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {
    const userId = req.params.userId

    const updatedUser = await UserModel.findByIdAndUpdate(userId, req.body, {
      new: true, // to use existing record n
      runValidators: true,
    })

    if (updatedUser) {
      res.send(updatedUser)
    } else {
      next(createError(404, `User with _id ${userId} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while updating user ${req.params.userId}`))
  }
})

export default businessUserRouter
