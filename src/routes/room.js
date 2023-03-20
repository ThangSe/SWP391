const roomController = require("../app/controllers/RoomController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()

router.get("/all-rooms", middlewareController.verifyToken, roomController.showAllRoom)
router.get("/detail-room/:id", middlewareController.verifyTokenManager, roomController.showDetailRoomById)
router.get("/owned-detail-room", middlewareController.verifyToken, roomController.showOwnedDetailRoom)
router.post("/new-room", middlewareController.verifyTokenManager, roomController.createRoom)
router.post("/update-room/:id", middlewareController.verifyTokenManager, roomController.updateRoom)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
