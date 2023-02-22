const authController = require('../app/controllers/AuthController')
const middlewareController = require("../app/controllers/MiddlewareController")
const router = require("express").Router()
// REGISTER
router.post("/register", authController.register)
// LOGIN
router.post("/login", authController.login)
// LOGOUT
router.post("/logout", middlewareController.verifyToken, authController.logout)
// REFRESH_TOKEN
router.post("/refresh", authController.requestRefreshToken)
module.exports = router
