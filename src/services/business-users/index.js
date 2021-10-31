import express from "express"
import createError from "http-errors"
import { generateJwt, JwtMiddleware } from "../../utils/auth/jwt.js"
import validations from "../../utils/validation/index.js"
import BusinessUserModel from "./schema.js"
import ReviewModel from "../reviews/schema.js"
import BusinessModel from "../business/schema.js"
import { adminOnly } from "../../utils/auth/adminOnly.js"
// import { onlyOwner } from "../../utils/auth/onlyOwner.js"


const { userBusinessValidationRules, validate } = validations

const businessUserRouter = express.Router()

// BUSINESS USER LOGIN ✅
businessUserRouter.post('/business/me', async (req, res, next) => {

  try {
      const { email, password } = req.body

      if (!email || !password) {
          const error = new Error("Missing credentials.")
          error.status = 400

          throw error
      }

      const user = await BusinessUserModel.findByCredentials(email, password)

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

// BUSINESS USER REGISTER ✅
businessUserRouter.post("/business/register", 
userBusinessValidationRules(),
validate,
async (req, res, next) => {
  try {
      const { website } = req.body
      const business = await BusinessModel.findOne({ website: website })

      if (business) {
        if (business.businessUserID) {

          next(createError(404, `This business has already been claimed. If this is an error please contact us.`))

        } else {

        const businessUser = await new BusinessUserModel({...req.body, ...business}).save();
        const updateBusiness = await BusinessModel.findByIdAndUpdate(business._id, {businessUserID: businessUser._id}, {
          new: true, // to use existing record n
          runValidators: true,
        })
        const updateUser = await BusinessUserModel.findByIdAndUpdate(businessUser._id, {businessID: business._id}, {
          new: true, // to use existing record n
          runValidators: true,
        })

        const token = await generateJwt({ id: businessUser._id })

        res.send({updateUser, token})
      }

      } else {

        const { businessName, website, category } = req.body

        const businessUser = await new BusinessUserModel(req.body).save();
        const business = await new BusinessModel({ businessName, website, category, businessUserID: businessUser._id}).save()

        const updateUser = await BusinessUserModel.findByIdAndUpdate(businessUser._id, {businessID: business._id}, {
          new: true, // to use existing record n
          runValidators: true,
        })

        const token = await generateJwt({ id: updateUser._id })

        res.send({ updateUser, token })


      }
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



// CREATE BUSINESS USER ✅
businessUserRouter.post("/business",
JwtMiddleware,
adminOnly,
userBusinessValidationRules(),
validate,
async (req, res, next) => {
  try {
    const { website } = req.body
    const business = await BusinessModel.findOne({ website: website })

    if (business) {
      if (business.businessUserID) {

        next(createError(404, `This business has already been claimed. If this is an error please contact us.`))

      } else {

      const businessUser = await new BusinessUserModel({...req.body, ...business}).save();
      const updateBusiness = await BusinessModel.findByIdAndUpdate(business._id, {businessUserID: businessUser._id}, {
        new: true, // to use existing record n
        runValidators: true,
      })
      const updateUser = await BusinessUserModel.findByIdAndUpdate(businessUser._id, {businessID: business._id}, {
        new: true, // to use existing record n
        runValidators: true,
      })

      const token = await generateJwt({ id: businessUser._id })

      res.send({updateUser, token})
    }

    } else {

      const { businessName, website, category } = req.body

      const businessUser = await new BusinessUserModel(req.body).save();
      const business = await new BusinessModel({ businessName, website, category, businessUserID: businessUser._id}).save()

      const updateUser = await BusinessUserModel.findByIdAndUpdate(businessUser._id, {businessID: business._id}, {
        new: true, // to use existing record n
        runValidators: true,
      })

      const token = await generateJwt({ id: updateUser._id })

      res.send({ updateUser, token })


    }
} catch (error) {
    console.log({ error });
    res.send(500).send({ message: error.message });
}
})

// GET ALL BUSINESS USERS ✅
businessUserRouter.get("/business",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    console.log(req.user)

    const users = await BusinessUserModel.find()

    res.send(users)

  } catch (error) {

    next(createError(500, "An error occurred while getting users' list "))

  }
})

// GET BUSINESS BY ID ✅
businessUserRouter.get("/business/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const userId = req.params.businessID

    const user = await BusinessUserModel.findById(userId)

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
businessUserRouter.delete("/business/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {
    const userId = req.params.businessID
    const { businessID } = await BusinessUserModel.findById(userId)

    const updatedBusiness = await BusinessModel.findByIdAndUpdate(businessID, { businessUserID: "" }, {
      new: true, // to use existing record n
      runValidators: true,
    })

    const deletedUser = await BusinessUserModel.findByIdAndDelete(userId)


    if (deletedUser) {
      res.status(204).send()
    } else {
      next(createError(404, `User with _id ${userId} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting user ${req.params.userId}`))
  }
})

// EDIT BUSINESS BY ID ✅
businessUserRouter.put("/business/:businessID",
JwtMiddleware,
adminOnly,
async (req, res, next) => {
  try {

    const businessID = req.params.businessID

    const updatedUser = await BusinessUserModel.findByIdAndUpdate(businessID, req.body, {
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
