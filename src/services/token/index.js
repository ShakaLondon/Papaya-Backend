import express from "express";
import createError from "http-errors";
import ReviewModel from "./schema.js";
import UserModel from "../users/schema.js";
import BusinessModel from "../business/schema.js";
import RefreshModel from "../token/schema.js";
import validations from "../../utils/validation/index.js";
import { adminOnly } from "../../utils/auth/adminOnly.js";
import { JwtMiddleware, generateJwt } from "../../utils/auth/jwt.js";

const tokenRouter = express.Router();

// CREATE REVIEW ✅
tokenRouter.post("/refreshtoken", async (req, res, next) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    const refreshToken = await RefreshModel.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshModel.verifyExpiration(refreshToken)) {
      RefreshModel.findByIdAndRemove(refreshToken._id, {
        useFindAndModify: false,
      }).exec();

      res.status(403).json({
        message: "Session Timeout! Please sign in again.",
      });
      return;
    } else {
      const newAccessToken = await generateJwt({ id: refreshToken.userID._id });

      return res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: refreshToken.token,
      });
    }
  } catch (err) {
    return res
    // .status(500).send({ message: err })
    .redirect('/login');
  }
});

export default tokenRouter;

// await MyModel.find({ name: /john/i }, 'name friends').exec();
