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
            req.ticket = saveTicket
            req.message = "Tạo đơn thành công"
            next()
        } catch (err) {
            if(err.name === "ValidationError") {
                res.status(500).json(Object.values(err.errors).map(val => val.message))
            } else {
                res.status(500).json(err)
            }
        }
    }

    async acceptTicket(req, res) {
        try {
            const ticket = await Ticket.findById(req.params.id)
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const manager_id = accountInfo.id
            const feedback = req.body.feedback
            if(ticket.status == "Chờ tiếp nhận") {
                await ticket.updateOne({$set: {status: 'Đã tiếp nhận', manager_id: manager_id, feedback: feedback}})
                res.status(200).json("Tiếp nhận đơn thành công")
            } else {
                res.status(400).json("Đơn không ở trạng thái chờ")
            }      
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async denyTicket(req, res) {
        try {
            const ticket = await Ticket.findById(req.params.id)
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const manager_id = accountInfo.id
            const feedback = req.body.feedback
            if(ticket.status == "Chờ tiếp nhận") {
                await ticket.updateOne({$set: {status: 'Đơn bị từ chối', manager_id: manager_id, feedback: feedback}})
                res.status(200).json("Từ chối đơn thành công")
            } else {
                res.status(400).json("Đơn không ở trạng thái chờ")
            }      
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async cancelTicket(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const sender_id = accountInfo.id
            const ticket = await Ticket.findOne({$and:[
                {_id: req.params.id},
                {sender_id: sender_id}
            ]})
            if(ticket.status == "Chờ tiếp nhận" || ticket.status == "Đã tiếp nhận") {
                await ticket.updateOne({$set: {status: 'Hủy bỏ'}})
                res.status(200).json("Hủy bỏ đơn thành công")
            } else {
                res.status(400).json("Không thể hủy bỏ đơn nữa")
            }      
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async confirmTicket(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const sender_id = accountInfo.id
            const ticket = await Ticket.findOne({$and:[
                {_id: req.params.id},
                {sender_id: sender_id}
            ]})
            const message = req.body.message
            if(ticket.status == "Chờ tiếp nhận" || ticket.status == "Đã tiếp nhận" && message == "Hủy bỏ") {
                await ticket.updateOne({$set: {status: 'Hủy bỏ'}})
                return res.status(200).json("Hủy bỏ đơn thành công")
            } else if(ticket.status == "Đã tiếp nhận" && message =="Đồng ý") {
                await ticket.updateOne({$set: {status: 'Đang xử lí'}})
                return res.status(200).json("Đơn đang được xử lí")
            } else {
                return res.status(200).json("Đơn bị hủy bỏ hoặc đã được xử lí")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async completeTicket(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const staff_id = accountInfo.id
            const ticket = await Ticket.findOne({$and:[
                {_id: req.params.id},
                {staff_id: staff_id}
            ]})
            const message = req.body.message
            if(ticket.status == "Đang xử lí" && message == "Thành công") {
                await ticket.updateOne({$set: {status: 'Đã được xử lí'}})
                return res.status(200).json("Hoàn thành đơn")
            } else if(ticket.status == "Đang xử lí" && message =="Thất bại") {
                await ticket.updateOne({$set: {status: 'Xử lí thất bại'}})
                return res.status(200).json("Đơn xử lí thất bại")
            } else {
                return res.status(200).json("Đơn ở trạng thái không hợp lệ")
            }
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async viewOwnedTicketList(req, res) {
        try {
            const token = req.headers.token
            const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
            const sender_id = accountInfo.id
            const {page = 1, limit = 10, sort = 1, status, type} = req.query
            const filter = {
                status: status,
                type: type,
                sender_id: sender_id
            }
            if(!status) filter.status = {$ne:null}
            if(!type) filter.type = {$ne:null}
            const tickets = await Ticket.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Ticket.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), tickets})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async getTicketById(req, res) {
        try {
             const ticketId = req.params.id
             const ticket = await Ticket.findById({_id: ticketId})
             res.status(200).json(ticket)
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async getTicketByIdForResident(req, res) {
        try {
             const ticketId = req.params.id
             const token = req.headers.token
             const accountInfo = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
             const sender_id = accountInfo.id
             const ticket = await Ticket.findOne({_id: ticketId, sender_id: sender_id})
             res.status(200).json(ticket)
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async assignStaffToTicket(req, res) {
        try {
            const ticketId = req.params.id
            const staffId = req.body.staffId
            await Ticket.findByIdAndUpdate({_id:ticketId}, {$set: {staff_id: staffId}})
            res.status(200).json("Cử nhân viên thành công")
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async addImageToTicket(req, res) {
        try {
            const upload = multer({
                storage,
                limits: {fileSize: 1 * 1024 * 1024 },
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
                const saveTicket = req.ticket
                if(req.files) {
                    const URLs = req.files.map(file => "https://aprartment-api.onrender.com/ticket/image/"+file.filename)
                    await Ticket.findByIdAndUpdate({_id: saveTicket.id},{$push: {imgUrls: {$each: URLs}}}) 
                }   
            })
            res.status(200).json(req.message)
        } catch (err) {
            res.status(500).json(err)
        }
    }
}

module.exports = new TicketController()
