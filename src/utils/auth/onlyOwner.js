import ReviewModel from "../../services/reviews/schema.js";

const onlyOwner = async (req, res, next) => {
  const review = await ReviewModel.findById(req.params.id);

  if (review.author._id.toString() !== req.user._id.toString()) {
    res
      .status(403)
      .send({ message: "You are not the owner of this blog post!" });
    return;
  } else {
    req.blog = blog;
    next();
  }
};

export default onlyOwner;
