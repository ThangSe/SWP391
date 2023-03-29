const Bill = require("../models/Bill")
const Account = require("../models/Account")
const User = require("../models/User")
class BillController {

    async showAllBill (req, res) {
        try {
            const {page = 1, limit = 10, sort = -1, status, roomnum} = req.query
            const filter = {
                status: status,
            }
            if(!status) filter.status = {$ne:null}
            const bills = await Bill.find(filter).populate([{
                path: 'room_id',
                model: 'room',
                select: 'roomnum'
            }]).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Bill.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), bills})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async showAllOwnedBill(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const resident_id = accountInfo.id
            const resident = await Account.findById(resident_id)
            const {page = 1, limit = 10, sort = -1, status} = req.query
            const filter = {
                status: status,
                user_id: resident.user_id
            }
            if(!status) filter.status = {$ne:null}
            const bills = await Bill.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Bill.find(filter).count()/limit
            if(bills) {
                res.status(200).json({count: Math.ceil(count), bills})
            }          
            else res.status(200).json("Chưa tồn tại hóa đơn nào")
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async detailBillById(req, res) {
        try {
            const bill = await Bill.findById(req.params.id).populate([{
                path: 'room_id',
                model: 'room',
                select: 'roomnum price'
            }, {
                path: 'serviceMonth',
                model: 'servicemonth',
                select: 'description timePerform price service_id',
                populate: [{
                    path: 'service_id',
                    model: 'service',
                    select: 'name price supplier'
                }]
            }])
            if(bill) {
                res.status(200).json(bill)
            } else res.status(400).json("Hóa đơn không còn tồn tại")
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async payBill(req, res) {
        try {
            await Bill.findByIdAndUpdate({_id: req.params.id}, {$set: {status: 'Đã thanh toán'}})
            res.status(200).json("Thanh toán thành công")
        } catch (err) {
            res.status(500).json(err)
        }
    }
    async depositToAccount(req, res) {
        try {
            const account = await Account.findById(req.params.id)
            await User.findOneAndUpdate({acc_id: account.id}, {$inc:{budget: req.body.amount}})
            res.status(200).json("Nạp tiền thành công")
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async withdrawFromAccount(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const resident_id = accountInfo.id
            const account = await Account.findById(resident_id)
            const amount = req.body.amount
            const user = await User.findOne({acc_id: account.id})
            if(amount <= user.budget) {
                await user.updateOne({$inc:{budget: -amount}})
                res.status(200).json("Rút tiền thành công")
            } else {
                res.status(200).json("Số dư không đủ")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async payBillByOwnedSystem(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const resident_id = accountInfo.id
            const user = await User.findOne({acc_id: resident_id})
            const bill = await Bill.findById(req.params.id)
            if(user.budget >= bill.totalPrice && bill.status == "Chưa thanh toán") {
                await bill.updateOne({$set: {status: 'Đã thanh toán'}, $inc: {purchase: bill.totalPrice}})
                await user.updateOne({$inc:{budget: -bill.totalPrice}})
                res.status(200).json("Thanh toán thành công")
            } else if(bill.status == "Còn nợ" && bill.totalPrice > bill.purchase) {
                const purchase = bill.totalPrice - bill.purchase
                if(user.budget >= purchase) {
                    await bill.updateOne({$set: {status: 'Đã thanh toán'}, $inc: {purchase: purchase}})
                    await user.updateOne({$inc:{budget: -purchase}})
                    res.status(200).json("Thanh toán thành công")
                } else res.status(200).json("Tài khoản không đủ tiền để thanh toán")
            } else {
                res.status(200).json("Tài khoản không đủ tiền để thanh toán")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }

}

module.exports = new BillController()
