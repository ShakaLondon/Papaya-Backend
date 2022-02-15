import createHttpError from "http-errors";

export const businessUserOnly = (req, res, next) => {
  if (req.user.businessID === req.params.businessID) {
    console.log(req.user, "Business Admin Only");
    next();
  } else {
    next(createHttpError(403));
  }
};
