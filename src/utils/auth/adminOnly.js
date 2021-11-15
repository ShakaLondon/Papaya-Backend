import createHttpError from "http-errors"

export const adminOnly = (req, res, next) => {
    if (req.user.role === "Admin") {
        console.log(req.user, "adminonly")
        next()
    } else {
        next(createHttpError(403))
    }
}

export const businessOnly = (req, res, next) => {
    if (req.user.role === "Business") {
        console.log(req.user, "businessonly")
        next()
    } else {
        next(createHttpError(403))
    }
}

export const userOnly = (req, res, next) => {
    if (req.user._id === req.body._id) {
        console.log(req.user, "businessonly")
        next()
    } else {
        next(createHttpError(403))
    }
}