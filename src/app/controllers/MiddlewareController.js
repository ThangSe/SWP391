const jwt = require("jsonwebtoken")

const middlewareController = {
    //vertify Tokenization
    
    verifyToken: (req, res, next) => {
        const token = req.headers.token
        if(token) {
            const accessToken = token.split(" ")[1]
            jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, account) => {
                if(err) {
                    return res.status(403).json("Token không khả dụng")
                }
                req.account = account
                next()
            })
        }
        else {
            res.status(401).json("Cần đăng nhập để tải trang")
        }
    },

    verifyTokenAdmin: (req, res, next) => {
        middlewareController.verifyToken(req,res, () => {
            if(req.account.role == "admin") {
                next()
            }
            else {
                res.status(403).json("Bạn không có quyền truy cập vào trang này")
            }
        })
    },
    verifyTokenManager: (req, res, next) => {
        middlewareController.verifyToken(req,res, () => {
            if(req.account.role == "manager" || req.account.role == "admin") {
                next()
            }
            else {
                res.status(403).json("Bạn không có quyền truy cập vào trang này")
            }
        })
    },
    verifyTokenCustomer: (req, res, next) => {
        middlewareController.verifyToken(req,res, () => {
            if(req.account.role == "resident") {
                next()
            }
            else {
                res.status(403).json("Bạn không có quyền truy cập vào trang này")
            }
        })
    }
}

module.exports = middlewareController
