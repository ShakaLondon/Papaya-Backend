import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const BusinessSchema = new Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    categoryID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // ref: "Category",
    },
    avatar:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      // default: "https://ui-avatars.com/api/?name=Unnamed+User",
    },
    productIDs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products"
    }],
    reviewIDs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reviews"
    }],
    businessUserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  },
  // {
  //   toObject: {
  //   virtuals: true
  //   },
  //   toJSON: {
  //   virtuals: true 
  //   }
  // }
)

BusinessSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryID',
  foreignField: '_id'
});

// BusinessSchema.virtual('reviews', {
//   ref: 'Reviews',
//   localField: 'reviewIDs',
//   foreignField: '_id'
// });

// BusinessSchema.virtual('reviews').set(function(_id) { 

//   const businessDocument = this

//   const business = businessDocument.findById(_id)

//   console.log(business)

//   // businessDocument.populate('reviewIDs')
  
//   return business });


// BusinessSchema.statics.findAverages = async function (catName) {

//   console.log(catName)

//   let strLowerCase = catName.toLowerCase();
//     let wordArr = strLowerCase.split(" ").map(function(currentValue) {
//         return currentValue[0].toUpperCase() + currentValue.substring(1);
//     });

//     const titleCaseCat = wordArr.join(" ")

//   const catDocument = this 

//   const category = await catDocument.findOne({ titleCaseCat })

//   console.log(category)

//   if(category) {
//     return category
//   } else {
//     const newCat = await new this ({name: titleCaseCat}).save()
//     return newCat
//   }
// }



BusinessSchema.set('toObject', { virtuals: true });
BusinessSchema.set('toJSON', { virtuals: true });

export default model("Business", BusinessSchema) // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code

