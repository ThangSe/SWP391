const ticketController = require("../app/controllers/TicketController")
const middlewareController = require("../app/controllers/MiddlewareController")
const imgFunc = require("../config/db/upload")

const router = require("express").Router()

router.post("/new-ticket", middlewareController.verifyTokenResident, ticketController.createTicket)
router.get("/all-ticket", middlewareController.verifyTokenManager, ticketController.showAllTicket)
router.get("/detail-ticket/:id", middlewareController.verifyTokenManager, ticketController.getTicketById)
router.get("/detail-owner-ticket/:id", middlewareController.verifyTokenResident, ticketController.getTicketByIdForResident)
router.get("/owned-ticket", middlewareController.verifyTokenResident, ticketController.viewOwnedTicketList)
router.post("/assign-staff-to-ticket/:id", middlewareController.verifyTokenManager, ticketController.assignStaffToTicket)
router.post("/accept-ticket/:id", middlewareController.verifyTokenManager, ticketController.acceptTicket)
router.post("/deny-ticket/:id", middlewareController.verifyTokenManager, ticketController.denyTicket)
router.post("/cancel-ticket/:id", middlewareController.verifyTokenResident, ticketController.cancelTicket)
router.post("/complete-ticket/:id", middlewareController.verifyTokenStaff, ticketController.completeTicket)
router.post("/confirm-ticket/:id", middlewareController.verifyTokenResident, ticketController.confirmTicket)
router.get("/image/:filename", imgFunc.getImg)
module.exports = router
