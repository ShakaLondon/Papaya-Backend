import mongoose from "mongoose"
import bcrypt from "bcrypt"

const { Schema, model } = mongoose

const UploadSchema = new Schema(
  {
    avatar: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    // userID: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User"
    // },
    profileID: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'rolePath',
      required: true,
    },
    rolePath: {
        type: String,
        // required: true,
        enum: ["BusinessUsers", "Users"]
      },
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  }
)


export default model("Upload", UploadSchema) // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code

