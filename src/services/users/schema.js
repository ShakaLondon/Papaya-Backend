import mongoose from "mongoose"

const { Schema, model } = mongoose

const UserSchema = new Schema(
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
    dateOfBirth:{
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    avatar:{
      type: String,
      required: true,
    }
  },
  {
    timestamps: true, // adding createdAt and modifiedAt automatically
  }
)

UserSchema.pre("save", async function (done) {
  this.avatar = `https://ui-avatars.com/api/?name=${this.name}+${this.surname}`;
  // hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12)
  }
  done();
});

// static: find using credentials

UserSchema.statics.findByCredentials = async function (email, password) {

  const user = await AuthorModel.findOne({ email })

  try {
    if (await bcrypt.compare(password, user.password))
      return user
  } catch { }

  return null
}

export default model("Users", UserSchema) // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code

