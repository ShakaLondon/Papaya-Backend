import { body, validationResult } from 'express-validator'
import UserModel from '../../services/users/schema.js'
import BusinessUserModel from "../../services/business-users/index.js";

export const userValidationRules = () => {

    const d = new Date();
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const cA = new Date(year - 18, month, day).toDateString();

 return [
//  CHECKS BODY REQUEST TO SEE IF IT FITS THE CORRECT STRUCTURE

 body("name").exists().withMessage("Name is a mandatory field!").isString().withMessage("Name must be a string"),
 body("surname").exists().withMessage("Surname is a mandatory field!").isString().withMessage("Surname must be a string"),
 body("username").exists().withMessage("Username is a mandatory field!").isString().withMessage("Username must be a string")
 .custom( async (value) => {
    return await UserModel.findOne({ username: value }).then(user => {
      if (user) {
        return Promise.reject('Username is already in use');
      }
    });
  }).custom( async (value) => {
    return await BusinessUserModel.findOne({ username: value }).then(user => {
      if (user) {
        return Promise.reject('Username is already in use');
      }
    });
  }),
 body("email").exists().withMessage("Email is a mandatory field!").isEmail().withMessage("Email is not a valid email address!")
 .custom( async (value) => {
    return await UserModel.findOne({ email: value }).then((user) => {
      if (user) {
        return Promise.reject('Email is already in use, please Login!');
      }
    });
  }).custom( async (value) => {
    return await BusinessUserModel.findOne({ email: value }).then((user) => {
      if (user) {
        return Promise.reject('Email is already in use, please Login!');
      }
    });
  }),
 body("password").exists().withMessage("Password is a mandatory field!").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 2, minSymbols: 1 }).withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, two numbers and one symbol!"),
 body("dateOfBirth").exists().withMessage("DOB value is a mandatory field").isDate().withMessage("Date invalid").isBefore(cA).withMessage("You need to be older than 18!"),
 
 ]
}

export const reviewValidationRules = () => {

 return [
//  CHECKS BODY REQUEST TO SEE IF IT FITS THE CORRECT STRUCTURE

 body("rating").exists().withMessage("Rating is a mandatory field!").isInt({ max: 5, min: 0 }).withMessage("Rating must be a number between 0 and 5."),
 body("comment").exists().withMessage("Comment is a mandatory field!").isString({ minLength: 50 }).withMessage("Comment must be at least 50 charaters."),
 body("title").exists().withMessage("Title is a mandatory field!").isString({ minLength: 10 }).withMessage("Title must be at least 10 characters."),
 body("userID").exists().withMessage("UserID is a mandatory field!")
 .custom( async (value) => {
    return await BusinessModel.findOne({ userID: value }).then((user) => {
      // FIX THIS MUST SEARCH BUSINESS REVIEWS SO ONE REVIEW PER USER PER BUSINESS
      if (user) {
        return Promise.reject('You can only leave one review per product.');
      }
    });
  }),
 ]
}

export const userBusinessValidationRules = () => {

return [
//  CHECKS BODY REQUEST TO SEE IF IT FITS THE CORRECT STRUCTURE

body("name").exists().withMessage("Name is a mandatory field!").isString().withMessage("Name must be a string"),
body("surname").exists().withMessage("Surname is a mandatory field!").isString().withMessage("Surname must be a string"),
body("username").exists().withMessage("Username is a mandatory field!").isString().withMessage("Username must be a string")
.custom( async (value) => {
  return await UserModel.findOne({ username: value }).then((user) => {
    if (user) {
      return Promise.reject('Username is already in use, please Login!');
    }})
}).custom( async (value) => {
  return await BusinessUserModel.findOne({ username: value }).then((user) => {
    if (user) {
      return Promise.reject('Username is already in use, please Login!');
    }})
}),
body("email").exists().withMessage("Email is a mandatory field!").isEmail().withMessage("Email is not a valid email address!")
.custom( async (value) => {
  return await UserModel.findOne({ email: value }).then((user) => {
    if (user) {
      return Promise.reject('Email is already in use, please Login!');
    }})
}).custom( async (value) => {
  return await BusinessUserModel.findOne({ email: value }).then((user) => {
    if (user) {
      return Promise.reject('Email is already in use, please Login!');
    }})
}),
body("password").exists().withMessage("Password is a mandatory field!").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 2, minSymbols: 1 }).withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, two numbers and one symbol!"),
body("website").exists().withMessage("Website is a mandatory field!").isURL().withMessage("Must be a valid website"),

]
}

export const businessValidationRules = () => {


  return [
  //  CHECKS BODY REQUEST TO SEE IF IT FITS THE CORRECT STRUCTURE
  
  body("businessName").exists().withMessage("Business name is a mandatory field!").isString().withMessage("Business name must be a string"),
  body("website").exists().withMessage("Website is a mandatory field!").isURL().withMessage("Must be a valid website"),
  body("category").exists().withMessage("Category is a mandatory field!").isString().withMessage("Category must be a string"),
  
  ]
  }

export const validate = (req, res, next) => {
    // ASSIGN VARIABLE TO VALIDATION RESULT OF REQUEST 
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    return next()
  }

//   IF ERRORS ARRAY IS NOT EMPTY PUSH ARRAY OF ERRORS TO VARIABLE
  const extractedErrors = []
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

  // RETURN ERRORS
  return res.status(422).json({
    errors: extractedErrors,
  })
}