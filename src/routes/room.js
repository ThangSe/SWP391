const roomController = require("../app/controllers/RoomController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()

router.get("/all-rooms", middlewareController.verifyTokenManager, roomController.showAllRoom)
router.post("/new-room", middlewareController.verifyTokenManager, roomController.createRoom)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
