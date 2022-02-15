import jwt from "jsonwebtoken";
import UserModel from "../../services/users/schema.js";
import BusinessUserModel from "../../services/business-users/schema.js";
import createError from "http-errors";

// Generate JWT tokens when we are authenticating one of our users

// function generateJwt

export function generateJwt(payload) {
  return new Promise(function (resolve, reject) {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY },
      (err, token) => {
        if (err) reject(err);
        else resolve(token);
      }
    );
  });
}

// Catch Token Expiry Error

const { TokenExpiredError } = jwt;

// const catchError = (err) => {
//   if (err instanceof TokenExpiredError) {
//     const error = new Error("Unauthorized! Access Token was expired!")
//     error.status = 401
//     return error;
//   }

//   const error = new Error("Unauthorized!")
//     error.status = 401
//     return error;;
// }

// Verify JWT tokens when we are checking the validity of incoming requests

// function verifyJwt

// export function verifyJwt(token) {
//     // return new Promise(function (resolve, reject) {
//         jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//             if (decoded){
//         return decoded
//         } else {
//         return err;
//         }
//         })
// })
// }

export async function JwtMiddleware(req, res, next) {
  try {
    if (!req.headers.authorization) {
      const error = new Error("Unauthorised Access");
      error.status = 401;
      next(error);
    } else {
      const token = req.headers.authorization.replace("Bearer ", "");

      console.log(token);

      try {
        // Parse the JWT string and store the result in `payload`.
        // Note that we are passing the key in this method as well. This method will throw an error
        // if the token is invalid (if it has expired according to the expiry time we set on sign in),
        // or if the signature does not match
        // const decoded = await verifyJwt(token)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded) {
          const role = req.body.role;

          if (role === "Business") {
            const user = await BusinessUserModel.findById(decoded.id);

            console.log(user);

            req.user = user;

            next();
          } else {
            const user = await UserModel.findById(decoded.id);

            console.log(user);

            req.user = user;

            next();
          }
        }
        // return decoded
      } catch (e) {
        if (e instanceof TokenExpiredError) {
          // if the error thrown is because the JWT is unauthorized, return a 401 error
          return res
            .status(401)
            .send({ message: "Unauthorized! Access Token was expired!" });
        }
        // otherwise, return a bad request error
        return res.status(400);
      }

      // try {
      //     const decoded = await verifyJwt(token)

      // } catch (error) {
      //     next()
      // }
    }
  } catch (error) {
    next(error);
  }
}
