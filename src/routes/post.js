const postController = require("../app/controllers/PostController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()

router.get("/all-tags", middlewareController.verifyTokenResident, postController.getAllTags)
router.get("/all-posts", middlewareController.verifyTokenResident, postController.getAllPost)
router.get("/owned-posts", middlewareController.verifyTokenResident, postController.getOwnedPost)
router.get("/detail-post/:id", middlewareController.verifyTokenResident, postController.getPostById)
router.post("/new-post", middlewareController.verifyTokenResident, postController.createNewPost)
router.post("/new-comment/:postId", middlewareController.verifyTokenResident, postController.createComment)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
