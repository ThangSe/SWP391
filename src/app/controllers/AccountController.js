const Account = require("../models/Account")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const Buffer = require('buffer').Buffer
const multer = require('multer')
const {storage, fileFind, deletedFile} = require('../../config/db/upload')

class AccountController {
    
    //Register manager accounts
    //POST /account/register
    async registerAccountManager(req, res) {
        try {
            const pass = req.body.password
            const hashed = await bcrypt.hash(pass, 10)
            const username = req.body.username
            const role = req.body.role
            const existedAccount = await Account.findOne({ username: username })
            if (existedAccount) return res.status(404).json("Người dùng đã tồn tại")
            const newAccount = await new Account({
                username,
                password: hashed,
                role
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
    //GET /account/all
    async getAllAccounts(req, res) {
        try {
            const {page = 1, limit = 10} = req.query
            let accounts = await Account.find().limit(limit * 1).skip((page - 1) * limit)
            let count = await Account.find().count()/limit
            res.status(200).json({count: Math.ceil(count), accounts})
        } catch (err) {
            res.status(500).json(err)
        }
            
    }
    //GET /account/account-detail
    getAllAccountsDetail(req, res, next) {
        Account.find({}).populate("user_id")
            .then(accounts => {
                res.status(200).json(accounts)
            })
            .catch(next)
    }
    //GET /account/username
    getAccountByUsername(req, res, next) {
        Account.findOne({username: req.params.username}).populate("user_id")
            .then(account => {
                res.status(200).json(account)
            })
            .catch(next)
    }
    showLastestAccount (req, res, next) {
        Account.find().sort({_id:-1}).limit(10)
            .then(accounts => {
                res.json(accounts)
            })
            .catch(next)
    }
    //DELETE /account/:id
    deleteAccount(req, res, next) {
        Account.delete({_id: req.params.id})
            .then(() => res.json("Xóa tài khoản thành công"))
            .catch(next)
    }
    //PATCH /account/:id/restore
    restoreAccount(req, res, next) {
        Account.restore({_id: req.params.id})
            .then(() => res.json("Khôi phục tài khoản thành công"))
            .catch(next)
    }
    //GET /account/:id
    getAccountById(req, res, next) {
        Account.findById(req.params.id).populate("user_id")
            .then(account => {
                res.status(200).json(account)
            })
            .catch(next)
    }
    //GET
    getAllResidentAccount(req, res, next) {
        Account.find({role: "resident"}).populate("user_id")
            .then(accounts => {
                res.status(200).json(accounts)
            })
            .catch(next)
    }
    //GET
    getAllManagerAccount(req, res, next) {
        Account.find({role: "manager"}).populate("user_id")
            .then(accounts => {
                res.status(200).json(accounts)
            })
            .catch(next)
    }
    //PATCH /change-password change password(customer)
    async updateAccountById(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const acc_id = accountInfo.id
            const oldPass = req.body.oldpass
            const newPass = req.body.newpass
            const repeatPass = req.body.repeatpass
            const account = await Account.findById(acc_id)
            const validOldPass = await bcrypt.compare(
                oldPass,
                account.password
            )
            if(newPass != repeatPass) {
                return res.status(404).json("Mật khẩu nhập lại không trùng khớp")
            }
            else if(!validOldPass) {
                return res.status(404).json("Sai mật khẩu")
            }
            else if (validOldPass && newPass == repeatPass) {
                const hashed = await bcrypt.hash(newPass, 10)     
                await account.updateOne({$set: {"password": hashed}})
                res.status(200).json("Cập nhật thành công")
            }    
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }
    //GET /account/view-profile (customer)
    async viewOwnedProfile(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const acc_id = accountInfo.id
            const account = await Account.findById(acc_id).populate("user_id")
            res.status(200).json(account.user_id)
        } catch (err) {
            res.status(500).json(err)
        }
    }
    //PATCH /account/editprofile (customer)
    async updateProfileAccount(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const acc_id = accountInfo.id
            const user = await User.findOne({acc_id: acc_id})
            await user.updateOne({$set: req.body})
            res.status(200).json("Cập nhật trang cá nhân thành công")
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }
    //PATCH /account/editimgprofile (customer)
    async deleteImgProfileAccount(req, res, next) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const acc_id = accountInfo.id
            const user = await User.findOne({acc_id:acc_id})
            if(user.imgURL){
                const filename = user.imgURL.replace("https://computer-services-api.herokuapp.com/account/avatar/","")
                const file = await fileFind(filename)
                if(file){
                    await deletedFile(file)
                }
                next()
            }else {
                next()
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async updateImgProfileAccount(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const acc_id = accountInfo.id
            const user = await User.findOne({acc_id:acc_id})  
            const upload = multer({
                storage,
                limits: {fileSize: 1 * 1024 * 1024 },
                fileFilter: (req, file, cb) => {
                    if(file.mimetype == "image/png" || file.mimetype == "image/jpeg" || file.mimetype == "image/jpg"){
                        cb(null, true)
                    }else {
                        cb(null, false)
                        const err = new Error('Only .png, .jpg and .jpeg format allowed')
                        err.name = 'ExtensionError'
                        return cb(err)
                    }
                }
            }).single('img')
            upload(req, res, async(err) => {
                if(err instanceof multer.MulterError) {
                    res.status(500).json(`Multer uploading error: ${err.message}`).end()
                    return
                } else if(err) {
                    if(err.name == 'ExtensionError') {
                        res.status(413).json(err.message).end()
                    } else {
                        res.status(500).json(`unknown uploading error: ${err.message}`).end()
                    }
                    return
                }
                const URL = "https://computer-services-api.herokuapp.com/account/avatar/"+req.file.filename
                await user.updateOne({$set: {imgURL: URL}})
                res.status(200).json('Upload success') 
            })                 
        } catch (err) {
            res.status(500).json(err)
        }
    }
}

module.exports = new AccountController()
