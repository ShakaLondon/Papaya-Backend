import mongoose from "mongoose";

const { Schema, model } = mongoose;

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentCategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      // required: true,
    },
    subCategoryIDs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    categoryLevel: {
      type: Number,
      // ref: "Category",
      required: true,
    },
    categoryList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "rolePath",
        required: true,
      },
    ],
    rolePath: {
      type: String,
      // required: true,
      enum: ["Business", "Products"],
    },
    // categoryListNo: {
    //   type: Number,
    // refPath: 'rolePath',
    // required: true,
    // },
  }
  // {
  //   toObject: {
  //   virtuals: true
  //   },
  //   toJSON: {
  //   virtuals: true
  //   }
  // }
);

CategorySchema.statics.findByName = async function (catName) {
  console.log(catName);

  let strLowerCase = catName.toLowerCase();
  let wordArr = strLowerCase.split(" ").map(function (currentValue) {
    return currentValue[0].toUpperCase() + currentValue.substring(1);
  });

  const titleCaseCat = wordArr.join(" ");

  const catDocument = this;

  const category = await catDocument.findOne({ titleCaseCat });

  console.log(category);

  if (category) {
    return category;
  } else {
    const newCat = await new this({ name: titleCaseCat }).save();
    return newCat;
  }
};

CategorySchema.virtual("categoryItems", {
  ref: ["Business", "Products"],
  localField: "_id",
  foreignField: "categoryID",
  // count: true
});

CategorySchema.virtual("categoryItemsNo", {
  ref: ["Business", "Products"],
  localField: "_id",
  foreignField: "categoryID",
  count: true,
});

CategorySchema.virtual("parentCategory", {
  ref: "Category",
  localField: "parentCategoryID",
  foreignField: "_id",
});

CategorySchema.virtual("subCategories", {
  ref: "Category",
  localField: "subCategoryIDs",
  foreignField: "_id",
});

CategorySchema.virtual("categoryListNo").get(function () {
  return this.categoryList.length;
});

// CategorySchema.virtual('categorySubCat').get(function() { return this.subCategoryIDs; });

CategorySchema.set("toObject", { virtuals: true });
CategorySchema.set("toJSON", { virtuals: true });

// CategorySchema.pre("init", async function (doc) {

//   const currentDoc = doc

//   console.log(currentDoc, "doc")

//   if (doc)

//   // if (this.isModified("categoryList")) {
//     {
// // {    const subcategories = currentDoc.subCategoryIDs

// //     console.log(subcategories, "here cutie")

//     const categoryListNo = currentDoc.categoryList

//     console.log(categoryListNo, "happy birthday")}
//   // }
//   // return doc
// });

CategorySchema.statics.findAverages = async function (category) {
  console.log(category.categoryItems, "this category");

  if (category.categoryItems.length > 0) {
    const newArray = [];

    category.categoryItems.forEach((catItem) => {
      const reviews = catItem.reviewIDs;

      console.log(reviews);

      const catListTotal = reviews?.reduce(function (a, b) {
        return { rating: a.rating + b.rating }; // returns object with property x
      });

      console.log(catListTotal);

      const averageValue = {
        business: catItem,
        count: reviews.length,
        totalScore: catListTotal.rating,
        average: catListTotal.rating / reviews.length,
      };

      console.log(averageValue);

      newArray.push(averageValue);
    });

    console.log(newArray);

    return newArray;
  }

  // let strLowerCase = catName.toLowerCase();
  //   let wordArr = strLowerCase.split(" ").map(function(currentValue) {
  //       return currentValue[0].toUpperCase() + currentValue.substring(1);
  //   });

  //   const titleCaseCat = wordArr.join(" ")

  // const catDocument = this

  // const category = await catDocument.findOne({ titleCaseCat })

  // console.log(category)

  // if(category) {
  //   return category
  // } else {
  //   const newCat = await new this ({name: titleCaseCat}).save()
  //   return newCat
  // }
};

export default model("Category", CategorySchema); // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code
