import createHttpError from "http-errors"

export const adminOnly = (req, res, next) => {
    if (req.user.role === "Admin") {
        console.log(req.user, "adminonly")
        next()
    } else {
        next(createHttpError(403))
    }
}