import express from "express";
import createError from "http-errors";
import CategoryModel from "./schema.js";
import UserModel from "../users/schema.js";
import BusinessModel from "../business/schema.js";
import validations from "../../utils/validation/index.js";
import { adminOnly } from "../../utils/auth/adminOnly.js";
import { JwtMiddleware } from "../../utils/auth/jwt.js";

const { reviewValidationRules, validate } = validations;

const categoryRouter = express.Router();

// CREATE CATEGORY ✅
categoryRouter.post("/", JwtMiddleware, adminOnly, async (req, res, next) => {
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
categoryRouter.get(
  "/",
  // JwtMiddleware,
  // adminOnly,
  async (req, res, next) => {
    try {
      const { limit, columns } = req.query;

      // console.log(page)

      const allCategories = await CategoryModel.find({
        categoryLevel: 1,
      }).populate([
        {
          path: "categoryItems",
          model: "Business",
        },
        {
          path: "categoryItems",
          model: "Products",
        },
        {
          path: "categoryItemsNo",
          model: "Products",
        },
        {
          path: "categoryItemsNo",
          model: "Business",
        },
        {
          path: "parentCategory",
          model: "Category",
          populate: {
            path: "parentCategory",
            model: "Category",
          },
          populate: {
            path: "subCategories",
            model: "Category",
          },
          // populate: {
          //   path: 'subCategories',
          //   model: 'Category',
          // },
          // populate: {
          //   path: 'parentCategory',
          //   model: 'Category',
          // },
        },
        {
          path: "subCategories",
          model: "Category",
          populate: {
            path: "subCategories",
            model: "Category",
          },
        },
        // {
        //   path: 'parentCatSub',
        //   model: 'Category',
        // }
      ]);

      const categories = await CategoryModel
        // .find()
        .aggregate([
          {
            $unwind: "$name",
          },
          // { $group: { _id: null,
          //   count: { $sum: 1 } } },
          // {
          //   "$lookup": {
          //     "from": "Category",
          //     "let": { "parentcatID": "$parentCategory" },
          //     "pipeline": [{ "$match": { "$expr": { "$eq": ["$_id", "$$parentcatID"] }}}],
          //     "as": "parent_category"
          //   }
          // },
          //     {
          //     $unwind: '$parent_category'
          // },
          //   {
          //     $project: {
          //        item: 1,
          //        categoryListNo: { $size: "$categoryList" }
          //     }
          //  },
          {
            $group: {
              _id: "$categoryLevel",
              totalCategories: {
                $sum: 1,
              },
              category_ID: {
                $addToSet: {
                  _id: "$_id",
                  // category: '$$ROOT',
                  name: "$name",
                  // categoryList: { $sum: "$categoryList" }
                },
                // categoryListNum: {

                // }
              },
              // count: { $sum: 1 }
            },
          },
          // { "$lookup": {
          //   "from": "Category",
          //   "let": { "categoryId": "$_id" },
          //   "pipeline": [
          //     { "$match": { "$expr": { "$eq": [ "$_id", "$$categoryId" ] }}},
          //     // { "$project": { "name": 1 }}
          //   ],
          //   "as": "category"
          // }},
          // {   $unwind: "$category" },
        ]);

      console.log(categories);

      // await categories.populate(['$category_ID'])
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

      //   const newResult = CategoryModel.find()
      //   .populate([{
      //     path: 'categoryItems',
      //     model: 'Business',
      //   },{
      //     path: 'categoryItems',
      //     model: 'Products',
      //   },{
      //     path: 'categoryItemsNo',
      //     model: 'Products',
      //   },{
      //     path: 'categoryItemsNo',
      //     model: 'Business',
      //   },{
      //     path: 'parentCategory',
      //     model: 'Category',
      //     populate: {
      //       path: 'subCategories',
      //       model: 'Category',
      //     },
      //     populate: {
      //       path: 'parentCategory',
      //       model: 'Category',
      //     },

      //   },{
      //     path: 'subCategories',
      //     model: 'Category',
      //     populate: {
      //       path: 'subCategories',
      //       model: 'Category',
      //     },
      //   },
      //   // {
      //   //   path: 'parentCatSub',
      //   //   model: 'Category',
      //   // }
      // ])
      // //  .then(categories => {

      //     // res.json(user);
      // //  });

      res.send({
        categories,
        allCategories: allCategories,
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
categoryRouter.get(
  "/:categoryName",
  // JwtMiddleware,
  // adminOnly,
  async (req, res, next) => {
    try {
      const categoryName = req.params.categoryName;

      const categorySearch = categoryName.replace(/_/g, " ");

      console.log(categorySearch);

      const categoryID = await CategoryModel.findOne({ name: categoryName })
        .populate([
          {
            path: "categoryItems",
            model: "Products",
          },
          {
            path: "categoryItems",
            model: "Business",
            populate: [
              {
                path: "avatar",
                model: "Upload",
              },
              {
                path: "reviewIDs",
                model: "Reviews",
              },
              {
                path: "categoryID",
                model: "Category",
                populate: {
                  path: "parentCategoryID",
                  model: "Category",
                },
              },
            ],
          },

          {
            path: "categoryItemsNo",
            model: "Products",
          },
          {
            path: "categoryItemsNo",
            model: "Business",
          },
          {
            path: "parentCategory",
            model: "Category",
            populate: [
              {
                path: "parentCategory",
                model: "Category",
              },
              {
                path: "subCategories",
                model: "Category",
              },
            ],
            // populate: {
            //   path: 'subCategories',
            // model: 'Category',
            // },
          },
          {
            path: "subCategories",
            model: "Category",
            populate: {
              path: "subCategoryIDs",
              model: "Category",
            },
          },
          // {
          //   path: 'categoryItemsNo',
          //   model: 'Products',
          //   count: true
          // },{
          //   path: 'categoryItemsNo',
          //   model: 'Business',
          //   count: true
          // },
        ])
        .exec(async function (err, categoryID) {
          if (categoryID.categoryItems.length > 0) {
            const catList = await CategoryModel.findAverages(categoryID);

            // return category

            if (catList) {
              res.send({
                category: { categoryID, categoryItemScores: catList },
              });
            } else {
              next(
                createError(
                  404,
                  `Category with name ${categoryName} not found!`
                )
              );
            }
          } else {
            if (categoryID) {
              res.send({
                category: { categoryID },
              });
            } else {
              next(
                createError(
                  404,
                  `Category with name ${categoryName} not found!`
                )
              );
            }
          }
        });

      // console.log(categoryID)
      // // const review = await BusinessModel.find({ categoryID: categoryID._id })

      // if (categoryID) {
      //   res.send(categoryID)
      // } else {
      //   next(createError(404, `Category with name ${categoryName} not found!`))
      // }
    } catch (error) {
      next(createError(500, "An error occurred while getting category"));
    }
  }
);

// GET SINGLE REVIEW
categoryRouter.get(
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

// GET SINGLE REVIEW
categoryRouter.get(
  "/parent/:categoryID",
  JwtMiddleware,
  adminOnly,
  async (req, res, next) => {
    try {
      const categoryID = req.params.categoryID;

      const review = await CategoryModel.find({ parentCategoryID: categoryID });

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
categoryRouter.delete(
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
categoryRouter.put(
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

export default categoryRouter;

// await MyModel.find({ name: /john/i }, 'name friends').exec();
