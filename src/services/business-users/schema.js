import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const BusinessUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    surname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: true,
      default: "https://ui-avatars.com/api/?name=Unnamed+User",
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User", "Business"],
      default: "Business",
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    businessID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  }
);

BusinessUserSchema.pre("save", async function (done) {
  this.avatar = `https://ui-avatars.com/api/?name=${this.name}+${this.surname}`;
  // hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  done();
});

BusinessUserSchema.methods.toJSON = function () {
  // console.log(this)
  // toJSON  is called every time res send is sent
  const userDocument = this;

  const docObject = userDocument.toObject();

  delete docObject.password;
  delete docObject.__v;

  console.log(docObject, "toJson");

  // const docJSON = docObject.toJSON()

  return docObject;
};

// static: find using credentials

BusinessUserSchema.statics.findByCredentials = async function (
  email,
  password
) {
  const user = await this.findOne({ email });

  console.log(user, password, user.password);

  if (user) {
    const userVerified = await bcrypt.compare(password, user.password);

    console.log(userVerified, "userFound");
    if (userVerified) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("BusinessUsers", BusinessUserSchema); // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code
