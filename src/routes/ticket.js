const ticketController = require("../app/controllers/TicketController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()

router.post("/new-ticket",middlewareController.verifyToken, ticketController.createTicket, ticketController.addImageComputerToTicket)
router.post("/all-ticket",middlewareController.verifyTokenManager, ticketController.showAllTicket)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
