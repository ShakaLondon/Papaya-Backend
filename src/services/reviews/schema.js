import mongoose from "mongoose"

const { Schema, model } = mongoose

const ReviewSchema = new Schema(
  {
    businessID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Business",
    },
    // businessName: {
    //   type: String,
    //   required: true,
    // },
    website: {
      type: String,
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    productIDs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
    }],
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    title:{
      type: String,
      required: true,
    },
    orderRef: {
      type: String,
    },
    // barcode:{
    //   type: Number,
    //   required: true,
    // },
    // barcodeType:{
    //   type: String,
    //   required: true,
    // },
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  }
)


export default model("Reviews", ReviewSchema) // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code

