import { body, validationResult } from 'express-validator'
import UserModel from '../../services/users/schema.js'

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
  }),
 body("email").exists().withMessage("Email is a mandatory field!").isEmail().withMessage("Email is not a valid email address!")
 .custom( async (value) => {
    return await UserModel.findOne({ email: value }).then((user) => {
      if (user) {
        return Promise.reject('Email is already in use, please Login!');
      }
    });
  }),
 body("password").exists().withMessage("Password is a mandatory field!").isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 2, minSymbols: 1 }).withMessage("Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, two numbers and one symbol!"),
 body("dateOfBirth").exists().withMessage("DOB value is a mandatory field").isDate().withMessage("Date invalid").isBefore(cA).withMessage("You need to be older than 18!"),
 
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