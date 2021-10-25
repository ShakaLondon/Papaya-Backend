import Blogs from "../../blogs/schema.js"

const onlyOwner = async (req, res, next) => {
    const blog = await Blogs.findById(req.params.id);

    if (blog.author._id.toString() !== req.user._id.toString()) {
        res.status(403).send({ "message": "You are not the owner of this blog post!" })
        return
    } else {
        req.blog = blog
        next()
    }
}

export default onlyOwner