const Account = require("../models/Account")
const Room = require("../models/Room")

class RoomController {
    async showAllRoom (req, res) {
        try {
            const {page = 1, limit = 10, sort = 1, status, type, price, furniture} = req.query
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const accountRole = accountInfo.role
            if(accountRole == "resident") {
                status = "Còn trống"
            }
            const filter = {
                status: status,
                type: type,
                price: price,
                furniture: furniture
            }
            if(!status) filter.status = {$ne:null}
            if(!type) filter.type = {$ne:null}
            if(!price) filter.price = {$ne:null}
            if(!furniture) filter.furniture = {$ne:null}
            const rooms = await Room.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Room.find().count()/limit
            return res.status(200).json({count: Math.ceil(count), rooms})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async createRoom(req, res) {
        try {
            const room = new Room(req.body)
            const saveRoom = await room.save()
            res.status(200).json(saveRoom)
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }
    // async updateRoomsInfo(req, res) {
    //     try {
            
    //     } catch (err) {
            
    //     }
    // }
}

module.exports = new RoomController()
