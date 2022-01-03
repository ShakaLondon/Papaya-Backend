import mongoose from "mongoose"

const { Schema, model } = mongoose

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentCategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      // required: true,
    },
    subCategoryIDs: [{
      type: mongoose.Schema.Types.ObjectId
    }]
  }
)

ProductSchema.statics.findByName = async function (catName) {

  console.log(catName)

  let strLowerCase = catName.toLowerCase();
    let wordArr = strLowerCase.split(" ").map(function(currentValue) {
        return currentValue[0].toUpperCase() + currentValue.substring(1);
    });

    const titleCaseCat = wordArr.join(" ")

  const catDocument = this 

  const category = await catDocument.findOne({ titleCaseCat })

  console.log(category)

  if(category) {
    return category
  } else {
    const newCat = await new this ({name: titleCaseCat}).save()
    return newCat
  }
}


export default model("Products", ProductSchema) // bounded to "users" collection

// seperate crud for embeded values check purchase history in riccardos code

