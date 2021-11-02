import jwt from "jsonwebtoken"
import UserModel from "../../services/users/schema.js"
import BusinessUserModel from "../../services/business-users/schema.js"



// Generate JWT tokens when we are authenticating one of our users

// function generateJwt 

export function generateJwt(payload) {
    return new Promise(function (resolve, reject) {
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 day" }, (err, token) => {
            if (err) reject(err)
            else resolve(token)
        })
    })
}


// Verify JWT tokens when we are checking the validity of incoming requests

// function verifyJwt 

export function verifyJwt(token) {
    return new Promise(function (resolve, reject) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) reject(err)
            else resolve(decoded)
        })
    })
}

// Catch Token Expiry Error

const { TokenExpiredError } = jwt;

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
  }

  return res.sendStatus(401).send({ message: "Unauthorized!" });
}



export async function JwtMiddleware(req, res, next) {
    try {
        if (!req.headers.authorization) {

            const error = new Error('No auth headers')
            error.status = 401
            next(error)
            
        } else {
            const token = req.headers.authorization.replace("Bearer ", '')

            console.log(token)

            const decoded = await verifyJwt(token)

            console.log(decoded)

            const role = req.body.role

            if (role === "Business") {

                const user = await BusinessUserModel.findById(decoded.id)

                console.log(user)

                req.user = user

                next()

            } else {

            const user = await UserModel.findById(decoded.id)

            console.log(user)

            req.user = user

            next()

            }

        }
    } catch (error) {
        next(error)
    }
}