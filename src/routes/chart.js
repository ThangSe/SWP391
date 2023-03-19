const chartController = require("../app/controllers/ChartController")
const middlewareController = require("../app/controllers/MiddlewareController")

const router = require("express").Router()

router.get("/dash-board", middlewareController.verifyTokenManager, chartController.dataForDashboard)
module.exports = router
