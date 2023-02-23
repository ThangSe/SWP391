const ticketController = require("../app/controllers/TicketController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")
const router = require("express").Router()

router.post("/new-ticket", middlewareController.verifyTokenResident, ticketController.createTicket)
router.get("/all-ticket", middlewareController.verifyTokenManager, ticketController.showAllTicket)
router.get("/owned-ticket", middlewareController.verifyTokenResident, ticketController.viewOwnedTicketList)
router.post("/accept-ticket/:id", middlewareController.verifyTokenManager, ticketController.acceptTicket)
router.post("/deny-ticket/:id", middlewareController.verifyTokenManager, ticketController.denyTicket)
router.post("/cancel-ticket/:id", middlewareController.verifyTokenResident, ticketController.cancelTicket)
router.post("/confirm-ticket/:id", middlewareController.verifyTokenResident, ticketController.confirmTicket)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
