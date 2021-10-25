import atob from "atob"
import AuthorModel from "../../authors/schema.js"

// basic middleware

const basicMiddleware = async (req, res, next) => {
    // check in the headers the credentials
    // username : password

    console.log(req.headers)

    const encodedCredentials = req.headers.authorization.replace("Basic ", '')
    console.log(encodedCredentials)

    const [email, password] = atob(encodedCredentials).split(":")

    console.log({ email, password })

    const user = await AuthorModel.findByCredentials(email, password)

    req.user = user

    next()

}

export default basicMiddleware

// check using bcrypt whether the hash of the password is matching the hash of the password for the provided username

// retrieve the username document

// PASSWORD HASH

// hashing is one-directional: 

// using bcrypt.compare
    // hash the provided password
    // check whether the hash is matching with the provided password hash

// if there is a match, the user is logged in.

// otherwise 401