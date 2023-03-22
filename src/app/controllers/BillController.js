const Bill = require("../models/Bill")
const Account = require("../models/Account")
class BillController {

    async showAllBill (req, res) {
        try {
            const {page = 1, limit = 10, sort = -1, status} = req.query
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
                select: 'roomnum'
            }, {
                path: 'serviceMonth',
                model: 'servicemonth',
                select: 'description timePerform service_id',
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



}

module.exports = new BillController()
