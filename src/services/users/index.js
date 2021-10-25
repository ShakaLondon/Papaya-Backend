import express from "express"
import createError from "http-errors"
import UsersModel from "./schema.js"

const userRouter = express.Router()

userRouter.post("/", async (req, res, next) => {
  try {

    const newAuthor = new AuthorModel(req.body)
    const { _id } = await newAuthor.save()

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

userRouter.get("/", async (req, res, next) => {
  try {

    const authors = await AuthorModel.find()

    res.send(authors)

  } catch (error) {

    next(createError(500, "An error occurred while getting authors' list "))

  }
})

userRouter.get("/:authorId", async (req, res, next) => {
  try {

    const authorId = req.params.authorId

    const author = await AuthorModel.findById(authorId)

    if (author) {
      res.send(author)
    } else {
      next(createError(404, `Author with _id ${authorId} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting author"))
  }
})

userRouter.delete("/:authorId", async (req, res, next) => {
  try {
    const authorId = req.params.authorId

    const deletedAuthor = await AuthorModel.findByIdAndDelete(authorId)

    if (deletedAuthor) {
      res.status(204).send()
    } else {
      next(createError(404, `Author with _id ${authorId} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while deleting author ${req.params.authorId}`))
  }
})

userRouter.put("/:authorId", async (req, res, next) => {
  try {
    const authorId = req.params.authorId

    const updatedAuthor = await AuthorModel.findByIdAndUpdate(authorId, req.body, {
      new: true, // to use existing record n
      runValidators: true,
    })

    if (updatedAuthor) {
      res.send(updatedAuthor)
    } else {
      next(createError(404, `Author with _id ${authorId} not found!`))
    }
  } catch (error) {
    next(createError(500, `An error occurred while updating author ${req.params.authorId}`))
  }
})

userRouter.get("/:authorId/blogs/", async (req, res, next) => {
  try {

    const authorId = req.params.authorId

    console.log(authorId)

    const authorSearch = String(authorId)

    console.log(authorSearch)

    const blogsByAuthor = await BlogModel.find({ author: { $in: authorSearch }}, 
    function(err, result) {
      if (err) {
        res.send(err);
      }
      })

    if (blogsByAuthor) {
      console.log(blogsByAuthor)
      res.send(blogsByAuthor)
    } else {
      next(createError(404, `Author with _id ${authorId} not found!`))
    }
  } catch (error) {
    next(createError(500, "An error occurred while getting author"))
  }
})

export default userRouter
