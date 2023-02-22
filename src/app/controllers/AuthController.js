const Account = require("../models/Account")
const User = require("../models/User")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const dotenv = require('dotenv')
const Buffer = require('buffer/').Buffer
dotenv.config()

class AuthController {
    //POST
    async register(req, res) {
        try {
            const pass = req.body.password
            const hashed = await bcrypt.hash(pass, 10)
            const username = req.body.username
            const existedAccount = await Account.findOne({ username: username })
            if (existedAccount) return res.status(404).json("Người dùng đã tồn tại")
            const newAccount = await new Account({
                username,
                password: hashed
            })
            const account = await newAccount
            const saveAccount = await account.save()
            const user = new User({phonenum: username})
            const saveUser = await user.save()
            const updateUser = await User.findById(saveUser.id)
            await updateUser.updateOne({$set: {acc_id: saveAccount.id}})
            if(saveAccount.id) {
                const account = Account.findById(saveAccount.id)
                await account.updateOne({$set: {user_id: saveUser._id}})
            }
            res.status(200).json(saveAccount)
        } catch (err) {
            res.status(500).json(err)
        }
        
    }

    generateAccessToken(account) {
        return jwt.sign({
            id: account.id,
            username: account.username,
            role: account.role
        }, process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
        )
    }
    generateRefreshToken(account) {
        return jwt.sign({
            id: account.id,
            username: account.username,
            role: account.role
        }, process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "1d" }
        )
    }

    async requestRefreshToken(req, res, next) {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.status(401).json("Bạn chưa đăng nhập")
        const existedToken = await Account.findOne({ refreshToken: refreshToken })
        if (!existedToken) return res.status(403).json("Token không khả dụng")
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, account) => {
            if (err) {
                console.log(err)
            }
            // create new accessToken, refreshToken
            const authController = new AuthController()
            const newAccessToken = authController.generateAccessToken(account)
            const newRefreshToken = authController.generateRefreshToken(account)
            const filter = { username: account.username }
            const update = { refreshToken: newRefreshToken }
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure:true,
                path: "/",
                sameSite:"none"
            })
            Account.findOneAndUpdate(filter, update, {
                new: true
            })
                .then(() => res.status(200).json({ accessToken: newAccessToken }))
                .catch(next)
        })
    }

    async login(req, res, next) {
        const account = await Account.findOne({ username: req.body.username, deleted: false })
        if (!account) {
            return res.status(404).json("Tài khoản không tồn tại")
        }
        const validPassword = await bcrypt.compare(
            req.body.password,
            account.password
        )
        if (!validPassword) return res.status(404).json("Sai mật khẩu")
        if (account && validPassword) {
            const authController = new AuthController()
            const accessToken = authController.generateAccessToken(account)
            const refreshToken = authController.generateRefreshToken(account)
            const filter = { username: account.username }
            const update = { refreshToken: refreshToken }
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure:true,
                path: "/",
                sameSite:"none"
            })
            const { password, ...others } = account._doc
            Account.findOneAndUpdate(filter, update, {
                new: true
            })
                .then(() => res.status(200).json({ ...others, accessToken }))
                .catch(next)
        }
    }
    async logout(req, res, next) {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            path: "/",
            sameSite: "none"
        })
        const token = req.headers.token
        const account = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
        Account.findOneAndUpdate({ username: account.username }, { refreshToken: "" }, { new: true })
            .then(() => res.status(200).json("Đăng xuất thành công"))
            .catch(next)
    }
}

module.exports = new AuthController()
