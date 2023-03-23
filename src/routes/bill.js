const billController = require("../app/controllers/BillController")
const middlewareController = require("../app/controllers/MiddlewareController")
const router = require("express").Router()

router.get("/all-bill", middlewareController.verifyTokenManager, billController.showAllBill)
router.get("/owned-bill", middlewareController.verifyTokenResident, billController.showAllOwnedBill)
router.get("/detail-bill/:id", middlewareController.verifyToken, billController.detailBillById)
router.post("/payment/:id", middlewareController.verifyTokenResident, billController.payBill)
router.post("/deposit-account/:id", middlewareController.verifyTokenManager, billController.depositToAccount)
router.post("/withdraw-account", middlewareController.verifyTokenResident, billController.withdrawFromAccount)
router.post("/payment-owned-system/:id", middlewareController.verifyTokenResident, billController.payBillByOwnedSystem)
module.exports = router
