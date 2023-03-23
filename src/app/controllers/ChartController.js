const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')   
const Bill = require('../models/Bill')
const Room = require('../models/Room')
const Ticket = require('../models/Ticket')
class ChartController {
    async dataForDashboard(req, res) {
        try {
            const toDay =  new Date()            
            const countEmptyRoom = await Room.find({status: 'Còn trống'}).count()
            const countNewTicketToDay = await Ticket.find({status: 'Chờ tiếp nhận', createdAt: {$gte: startOfDay(toDay), $lt: endOfDay(toDay)}}).count()
            const countWaitingTicket = await Ticket.find({status: 'Chờ tiếp nhận'}).count()
            const countCompleteTicketToDay = await Ticket.find({status: 'Đã được xử lí', updatedAt: {$gte: startOfDay(toDay), $lt: endOfDay(toDay)}}).count()
            const countAllCompleTicket = await Ticket.find({status: 'Đã được xử lí'}).count()
            const countFailTicketToday = await Ticket.find({status: 'Xử lí thất bại', updatedAt: {$gte: startOfDay(toDay), $lt: endOfDay(toDay)}}).count()
            const countFailTicket = await Ticket.find({status: 'Xử lí thất bại'}).count()
            const countExpBill = await Bill.find({status: 'Quá hạn'}).count()

            const emptyRoom = {
                "name": "Phòng còn trống",
                "count": countEmptyRoom
            }
            const newTicket = {
                "name": "Số đơn yêu cầu mới",
                "count": countNewTicketToDay
            }
            const waitingTicket = {
                "name": "Số đơn chưa được tiếp nhận",
                "count": countWaitingTicket
            }
            const newCompleteTicket = {
                "name": "Số đơn mới hoàn thành",
                "count": countCompleteTicketToDay
            }
            const completeTicket = {
                "name": "Số đơn đã hoàn thành",
                "count": countAllCompleTicket
            }

            const newFailTicket = {
                "name": "Số đơn xử lí không thành công mới",
                "count": countFailTicketToday
            }

            const failTicket = {
                "name": "Số xử lí không thành công",
                "count": countFailTicket
            }

            const expBill = {
                "name": "Số hóa đơn quá hạn thanh toán",
                "count": countExpBill
            }

            const datas = {
                emptyRoom,
                newTicket,
                waitingTicket,
                newCompleteTicket,
                completeTicket,
                newFailTicket,
                failTicket,
                expBill
            }
            res.status(200).json(datas)
        } catch (err) {
            res.status(500).json(err)
        }
    }

}

module.exports = new ChartController()
