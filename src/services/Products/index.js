import express from "express";
import createError from "http-errors";
import ProductModel from "./schema.js";
import UserModel from "../users/schema.js";
import BusinessModel from "../business/schema.js";
import validations from "../../utils/validation/index.js";
import { adminOnly } from "../../utils/auth/adminOnly.js";
import { JwtMiddleware } from "../../utils/auth/jwt.js";

const { reviewValidationRules, validate } = validations;

const productRouter = express.Router();

// CREATE CATEGORY ✅
productRouter.post("/", JwtMiddleware, adminOnly, async (req, res, next) => {
  try {
    const newCategory = new CategoryModel(req.body);
    const { _id, name } = await newCategory.save();
    console.log(name);

    res.status(201).send({ _id: _id, name: name });
  } catch (error) {
    if (error.name === "ValidationError") {
      next(createError(400, error));
    } else {
      console.log(error);

      next(createError(500, "An error occurred while creating new category"));
    }
  }
});

// GET ALL CATEGORIES ✅
productRouter.get(
  "/",
  // JwtMiddleware,
  // adminOnly,
  async (req, res, next) => {
    try {
      const { limit, columns } = req.query;

      // console.log(page)

      const categories = await CategoryModel.find().aggregate([
        // {
        //   "$set": {
        //     "companiesAndProducts": {
        //       "$setUnion": [
        //         "$likes",
        //         "$dislikes"
        //       ]
        //     }
        //   }
        // },
        {
          $lookup: {
            from: "Category",
            localField: "_id",
            foreignField: "postId",
            as: "post_actions",
          },
        },
      ]);
      // .limit(limit * 1)
      // .skip((page - 1) * limit)
      // .exec();

      const count = await CategoryModel.countDocuments();

      console.log(columns);

      const numberArray = [...Array(Number(columns)).keys()];

      console.log(numberArray);

      const resultArray = [];

      const columNum = Number(columns);

      // numberArray.forEach(async (number, idx) => {

      // let categoryGroup = await CategoryModel.find()
      //   .limit(limit * 1)
      //   .skip((number) * limit)

      //     console.log(categoryGroup)

      //   resultArray[idx] = categoryGroup

      //   console.log(resultArray, "resultarray" )

      //   return resultArray

      // });

      for (const x of numberArray) {
        let categoryGroup = await CategoryModel.find()
          .limit(limit * 1)
          .skip(x * limit);

        console.log(categoryGroup);

        // resultArray.push(categoryGroup)

        resultArray[x] = categoryGroup;
      }
      // if ( sorted.length > 0 ){
      console.log(resultArray, "sorted");

      res.send({
        categories,
        pages: resultArray,
        totalPages: Math.ceil(count / limit),
        // currentPage: page
      });

      // }
    } catch (error) {
      next(createError(500, "An error occurred while getting category' list "));
    }
  }
);

// GET SINGLE REVIEW BY NAME
productRouter.get(
  "/:categoryName",
  // JwtMiddleware,
  // adminOnly,
  async (req, res, next) => {
    try {
      const categoryName = req.params.categoryName;

      const categoryID = await CategoryModel.findOne({ name: categoryName });

      const review = await BusinessModel.find({ category: categoryID._id });

      if (review) {
        res.send(review);
      } else {
        next(createError(404, `Category with _id ${categoryID} not found!`));
      }
    } catch (error) {
      next(createError(500, "An error occurred while getting category"));
    }
  }
);

// GET SINGLE REVIEW
productRouter.get(
  "/:categoryID",
  JwtMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const categoryID = req.params.categoryID;

      const review = await CategoryModel.findById(categoryID);

      if (review) {
        res.send(review);
      } else {
        next(createError(404, `Category with _id ${categoryID} not found!`));
      }
    } catch (error) {
      next(createError(500, "An error occurred while getting category"));
    }
  }
);

// DELETE SINGLE REVIEW ✅
productRouter.delete(
  "/:categoryID",
  JwtMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const categoryID = req.params.categoryID;

      const { _id, userID } = await CategoryModel.findById(categoryID);

      const deletedCategory = await CategoryModel.findByIdAndDelete(reviewID);

      if (deletedReview) {
        res.status(204).send();
      } else {
        next(createError(404, `Category with _id ${categoryID} not found!`));
      }
    } catch (error) {
      next(
        createError(
          500,
          `An error occurred while deleting category ${req.params.categoryID}`
        )
      );
    }
  }
);

// EDIT SINGLE CATEGORY ✅
productRouter.put(
  "/:categoryID",
  JwtMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const categoryID = req.params.categoryID;

      const updatedCategory = await CategoryModel.findByIdAndUpdate(
        categoryID,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

      if (updatedCategory) {
        res.send(updatedCategory);
      } else {
        next(createError(404, `Category with _id ${categoryID} not found!`));
      }
    } catch (error) {
      next(
        createError(
          500,
          `An error occurred while updating category ${req.params.categoryID}`
        )
      );
    }
  }
);

export default productRouter;

// await MyModel.find({ name: /john/i }, 'name friends').exec();
