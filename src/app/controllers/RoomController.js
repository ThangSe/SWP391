const Account = require("../models/Account")
const Room = require("../models/Room")
const Buffer = require('buffer').Buffer
const multer = require('multer')
const {storage} = require('../../config/db/upload')

class RoomController {
    async showAllRoom (req, res) {
        try {
            const {page = 1, limit = 10, sort = 1, status, type, price, furniture} = req.query
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const accountRole = accountInfo.role
            const filter = {
                status: (accountRole == "resident") ? 'Còn trống' : status,
                type: type,
                price: price,
                furniture: furniture
            }
            if(!status) filter.status = {$ne:null}
            if(!type) filter.type = {$ne:null}
            if(!price) filter.price = {$ne:null}
            if(!furniture) filter.furniture = {$ne:null}
            const rooms = await Room.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Room.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), rooms})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async createRoom(req, res) {
        try {
            const upload = multer({
                storage,
                limits: {fileSize: 3 * 1024 * 1024 },
                fileFilter: (req, file, cb) => {
                    if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
                        cb(null, true)
                    }else {
                        cb(null, false)
                        const err = new Error('Chỉ nhận định dạng .png, .jpg và .jpeg')
                        err.name = 'ExtensionError'
                        return cb(err)
                    }
                }
            }).array('img', 5)
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
                if(req.files.length > 0) {
                    const data = JSON.parse(req.body.data)
                    const room = new Room(data)
                    const saveRoom = await room.save()
                    const URLs = req.files.map(file => "https://aprartment-api.onrender.com/room/image/"+file.filename)
                    const account = await Account.findOne({username: { $regex: saveRoom.roomnum, $options: 'i'}})
                    await account.updateOne({$set: {room_id: saveRoom.id}})
                    await Room.findByIdAndUpdate({_id: saveRoom.id}, {$set: {resident_id: account.id}, $push: {imgUrls: {$each: URLs}}}, {new: true})
                    res.status(200).json("Tạo phòng thành công")
                }   
                else res.status(400).json('Chưa chọn file')
            })
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }

    async showDetailRoomById(req, res) {
        try {
            const room = Room.findById(req.params.id).populate([
                {
                    path: 'bill_id',
                    model: 'bill',
                },
                {
                    path: 'resident_id',
                    model: 'account',
                    select: 'user_id',
                    populate: [{
                        path: 'user_id',
                        model: 'user',
                        select: 'name email gender address phonenum birth families imgURL'
                    }]
                }
            ])
            res.status(200).json(room)
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }

    async showOwnedDetailRoom(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const resident_id = accountInfo.id
            const room = Room.findOne({resident_id: resident_id}).populate([
                {
                    path: 'bill_id',
                    model: 'bill',
                },
                {
                    path: 'resident_id',
                    model: 'account',
                    select: 'user_id',
                    populate: [{
                        path: 'user_id',
                        model: 'user',
                        select: 'name email gender address phonenum birth families imgURL'
                    }]
                }
            ])
            res.status(200).json(room)
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
