const Bill = require("../models/Bill")
const Room = require("../models/Room")
const startOfMonth = require('date-fns/startOfMonth')
const endOfMonth = require('date-fns/endOfMonth')
const startOfYear = require('date-fns/startOfYear')
const endOfYear = require('date-fns/endOfYear')
class BillController {

    async showAllBill (req, res) {
        try {
            const {page = 1, limit = 10, sort = -1, status, dueDate, month, year} = req.query
            const filter = {
                status: status,
                type: type,
                title: { $regex: title, $options: 'i'},
            }
            if(!status) filter.status = {$ne:null}
            const bills = await Bill.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Bill.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), bills})
        } catch (err) {
            res.status(500).json(err)
        }
    }

}

module.exports = new BillController()
