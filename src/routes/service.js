const serviceController = require("../app/controllers/ServiceController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()

router.get("/all-services", middlewareController.verifyToken, serviceController.showAllService)
router.get("/detail-service/:id", middlewareController.verifyToken, serviceController.showDetailServiceById)
router.post("/new-service", middlewareController.verifyTokenManager, serviceController.createService)
router.post("/update-service/:id", middlewareController.verifyTokenManager, serviceController.updateService)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
