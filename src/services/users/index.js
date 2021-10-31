import express from "express"
import createError from "http-errors"
import { generateJwt, JwtMiddleware } from "../../utils/auth/jwt.js"
import UserModel from "./schema.js"
import ReviewModel from "../reviews/schema.js"
import validations from "../../utils/validation/index.js"
import { adminOnly } from "../../utils/auth/adminOnly.js"
// import { onlyOwner } from "../../utils/auth/onlyOwner.js"

const { userValidationRules, reviewValidationRules, validate } = validations

const userRouter = express.Router()

// LOGIN ✅
userRouter.post('/me', async (req, res, next) => {

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

// REGISTER ✅
userRouter.post("/register", 
userValidationRules(),
validate,
async (req, res, next) => {
  try {
      const user = await new UserModel(req.body).save();
      delete user._doc.password

      const token = await generateJwt({ id: user._id })

      res.send({ user, token })
  } catch (error) {
      console.log({ error });
      res.send(500).send({ message: error.message });
  }
});

// GET REVIEWS FOR USER 
userRouter.get('/me/reviews',
JwtMiddleware,
async (req, res, next) => {

  try {
    const reviews = await ReviewModel.find({ userID: req.user._id.toString() })

    res.status(200).send(reviews)

  } catch (error) {
    next(error)
  }

})

// EDIT ONE REVIEW FOR USER
userRouter.put('/me/reviews/:reviewID',
JwtMiddleware,
async (req, res, next) => {

  try {

  const reviewID = req.params.reviewID

  const updatedReview = await ReviewModel.findByIdAndUpdate(reviewID, req.body, {
    new: true, // to use existing record n
    runValidators: true,
  })

  if (updatedReview) {
    res.send(updatedReview)
  } else {
    next(createError(404, `User with _id ${reviewID} not found!`))
  }
} catch (error) {
  next(createError(500, `An error occurred while updating user ${req.params.reviewID}`))
}

})

// DELETE ONE REVIEW FOR USER
userRouter.delete('/me/reviews/:reviewID',
JwtMiddleware,
async (req, res, next) => {

  try {
    const reviewID = req.params.reviewID

    const deletedReview = await ReviewModel.findByIdAndDelete(reviewID)

    if (deletedReview) {
      res.status(204).send()
    } else {
      next(createError(404, `User with _id ${reviewID} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting user ${req.params.reviewID}`))
  }

})

// ADD ONE REVIEW FOR USER FOR BUSINESS
userRouter.post('/me/reviews/business/:businessID',
JwtMiddleware,
reviewValidationRules(),
validate,
async (req, res, next) => {

  try {
    const businessID = req.params.businessID

    const newReview = new ReviewModel({...req.body, userID: req.user._id})
    const { _id } = await newReview.save()

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(businessID, { $push: { reviewIDs: _id } }, {
      new: true, // to use existing record n
      runValidators: true,
    })

    const updatedUser = await UserModel.findByIdAndUpdate(req.user._id, { $push: { reviewIDs: _id } }, {
      new: true, // to use existing record n
      runValidators: true,
    })

    res.status(201).send({ _id })

    const deletedReview = await ReviewModel.findByIdAndDelete(reviewID)

    if (deletedReview) {
      res.status(204).send()
    } else {
      next(createError(404, `User with _id ${reviewID} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting user ${req.params.reviewID}`))
  }

})



// CREATE USER ✅
userRouter.post("/",
JwtMiddleware,
adminOnly,
userValidationRules(),
validate,
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

// GET ALL USERS ✅
userRouter.get("/",
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

// GET USER BY ID ✅
userRouter.get("/:userId",
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

// DELETE USER BY ID ✅
userRouter.delete("/:userId",
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

// EDIT USER BY ID ✅
userRouter.put("/:userId",
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

// GET ALL BLOGS BY USER ✅
userRouter.get("/:userId/reviews/",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const userId = req.params.userId

    console.log(userId)

    const userSearch = String(userId)

    console.log(userSearch)

    const reviewsByUser = await ReviewModel.find({ userID: { $in: userSearch }}, 
    function(err, result) {
      if (err) {
        res.send(err);
      }
      })

    if (reviewsByUser) {
      console.log(reviewsByUser)
      res.send(reviewsByUser)
    } else {
      next(createError(404, `User with _id ${userId} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting user"))
  }
})

export default userRouter
