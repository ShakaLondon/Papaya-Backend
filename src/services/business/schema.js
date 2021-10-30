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
    category: {
      type: String,
      required: true,
    },
    productIDs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products"
    }],
    reviewIDs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reviews"
    }],
    businessUserID:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  }
)


export default model("Business", BusinessSchema) // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code

