import express from "express"
import createError from "http-errors"
import { generateJwt } from "../../utils/auth/jwt.js"
import UserModel from "./schema.js"
import { userValidationRules, validate } from "../../utils/validation/index.js"


const userRouter = express.Router()

userRouter.post('/login', async (req, res, next) => {

  try {
      const { email, password } = req.body

      if (!email || !password) {
          const error = new Error("Missing credentials.")
          error.status = 400

          throw error
      }

      const user = await UserModel.findByCredentials(email, password)

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

// CREATE USER
userRouter.post("/", async (req, res, next) => {
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

// GET ALL USERS
userRouter.get("/", async (req, res, next) => {
  try {

    const users = await UserModel.find()

    res.send(users)

  } catch (error) {

    next(createError(500, "An error occurred while getting users' list "))

  }
})

// GET USER BY ID
userRouter.get("/:userId", async (req, res, next) => {
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
userRouter.delete("/:userId", async (req, res, next) => {
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

// EDIT USER BY ID
userRouter.put("/:userId", async (req, res, next) => {
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

// GET ALL BLOGS BY USER
userRouter.get("/:userId/blogs/", async (req, res, next) => {
  try {

    const userId = req.params.userId

    console.log(userId)

    const userSearch = String(userId)

    console.log(userSearch)

    const blogsByUser = await BlogModel.find({ user: { $in: userSearch }}, 
    function(err, result) {
      if (err) {
        res.send(err);
      }
      })

    if (blogsByUser) {
      console.log(blogsByUser)
      res.send(blogsByUser)
    } else {
      next(createError(404, `User with _id ${userId} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting user"))
  }
})

export default userRouter
