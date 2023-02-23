const Account = require("../models/Account")
const Ticket = require("../models/Ticket")
const Buffer = require('buffer').Buffer
const multer = require('multer')
const {storage, fileFind, deletedFile} = require('../../config/db/upload')

class TicketController {
    async showAllTicket (req, res) {
        try {
            const {page = 1, limit = 10, sort = 1, status, type} = req.query
            const filter = {
                status: status,
                type: type
            }
            if(!status) filter.status = {$ne:null}
            if(!type) filter.type = {$ne:null}
            const tickets = await Ticket.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Ticket.find().count()/limit
            return res.status(200).json({count: Math.ceil(count), tickets})
        } catch (err) {
            res.status(500).json(err)
        }
    }
    async createTicket(req, res, next) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const sender_id = accountInfo.id
            const ticket = new Ticket(req.body)
            const saveTicket = await ticket.save()
            await Ticket.findByIdAndUpdate({_id: saveTicket.id}, {$set: {sender_id: sender_id}}, {new: true})
            await Account.findByIdAndUpdate({_id: sender_id}, {$push: {ticket_id: saveTicket.id}})
            // req.ticket = saveTicket
            // req.message = "Tạo đơn thành công"
            // next()
            res.status(200).json('Tạo đơn thành công')
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }

    // async addImageComputerToTicket(req, res) {
    //     try {
    //         const upload = multer({
    //             storage,
    //             limits: {fileSize: 1 * 1024 * 1024 },
    //             fileFilter: (req, file, cb) => {
    //                 if(file.originalname.match(/\.(jpg|png|jpeg)$/)){
    //                     cb(null, true)
    //                 }else {
    //                     cb(null, false)
    //                     const err = new Error('Chỉ nhận định dạng .png, .jpg và .jpeg')
    //                     err.name = 'ExtensionError'
    //                     return cb(err)
    //                 }
    //             }
    //         }).array('img', 5)
    //         upload(req, res, async(err) => {
    //             if(err instanceof multer.MulterError) {
    //                 res.status(500).json(`Multer uploading error: ${err.message}`).end()
    //                 return
    //             } else if(err) {
    //                 if(err.name == 'ExtensionError') {
    //                     res.status(413).json(err.message).end()
    //                 } else {
    //                     res.status(500).json(`unknown uploading error: ${err.message}`).end()
    //                 }
    //                 return
    //             }
    //             const saveTicket = req.ticket
    //             if(req.files) {
    //                 const URLs = req.files.map(file => "https://aprartment-api.onrender.com/ticket/image/"+file.filename)
    //                 await Ticket.findByIdAndUpdate({_id: saveTicket.id},{$set: {imgUrls: []}})
    //                 await Ticket.findByIdAndUpdate({_id: saveTicket.id},{$push: {imgUrls: {$each: URLs}}})

    //             }
    //             if(req.message) {
    //                 res.status(200).json(req.message)   
    //             }
    //             else res.status(200).json('Tải ảnh thành công')   
    //         })
    //     } catch (err) {
    //         res.status(500).json(err)
    //     }
    //}
}

module.exports = new TicketController()
