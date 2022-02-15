// ERROR MIDDLEWARE --> (err, req, res, next) => {}

// ERROR IF BODY REQUEST IS EMPTY OR UNDEFINED
export const notFoundMiddleware = (err, req, res, next) => {
  if (err.status === 404) {
    res.status(404).send({ successful: false, message: err.message });
  } else {
    next(err);
  }
};

//  ERROR FOR WHEN THE REQUEST BODY DOES NOT PASS THE VALIDATION CHECKS AND RETURNS A VALIDATION ERROR
export const entryForbiddenMiddleware = (err, req, res, next) => {
  if (err.status === 400) {
    res.status(400).send(err.errorsList);
    // ERRORS LIST FOUND IN INDEX POST REQUEST
  } else {
    next(err);
  }
};

//  ALL OTHER ERRORS END HERE
export const catchAllErrorHandler = (err, req, res, next) => {
  console.log(err);
  res.status(500).send("Generic Server Error");
};
