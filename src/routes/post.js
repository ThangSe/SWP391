const postController = require("../app/controllers/PostController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()


router.get("/image/:filename", imgFunc.getImg)
module.exports = router
