import { body, checkSchema, validationResult } from "express-validator";
import createError from "http-errors";

     let d = new Date();
     let year = d.getFullYear();
     let month = d.getMonth();
     let day = d.getDate();
     let minAge = new Date(year - 16, month, day).toDateString();

const userSchema = {
    "name": {
        in: ["body"],
        isString: {
            errorMessage: "Name must be a string."
        }
    },
    "surname": {
        in: ["body"],
        isString: {
            errorMessage: "Surname must be a string."
        }
    },
    "username": {
        in: ["body"],
        isString: {
            errorMessage: "Username must be a string."
        },
        custom: {
            options: (value, { req, location, path }) => {
                return Users.find({
                    username: value
                }).then(user => {
                    if (user.length > 0) {
                        return Promise.reject('Username already in use');
                    }
                });
            },
          },
    },
    "dateOfBirth": {
        in: ["body"],
        isDate: {
            errorMessage: "Date format is invalid."
        },
        isBefore: (minAge)
    },
    "email": {
        in: ["body"],
        isEmail: {
            errorMessage: "Email format is invalid."
        },
        custom: {
            options: (value, { req, location, path }) => {
                return Users.find({
                    email: value
                }).then(user => {
                    if (user.length > 0) {
                        return Promise.reject('Email is already in use');
                    }
                });
            },
          },
    },
    "password": {
        in: ["body"],
        isStrongPassword: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 2,
            errorMessage: "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
        }
    }
}



const validateUserBody = checkSchema(userSchema)

const checkSchemaErrors = (req, res, next)=>{
    try {
        
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            next(createError(400, "Validation error", errors))
        } else{
            next()
        }
    } catch (error) {
        next()
    }
}


const schemaValidation = {
    validateUserBody: validateUserBody,
    checkSchemaErrors: checkSchemaErrors
}

export default schemaValidation
