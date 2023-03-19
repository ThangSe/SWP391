const startOfDay = require('date-fns/startOfDay')
const endOfDay = require('date-fns/endOfDay')   
const startOfMonth = require('date-fns/startOfMonth')
const endOfMonth = require('date-fns/endOfMonth')
const startOfYear = require('date-fns/startOfYear')
const endOfYear = require('date-fns/endOfYear')
const Room = require('../models/Account')
const Ticket = require('../models/Ticket')

class ChartController {
    // async dataToChart (req, res) {
    //     try {
    //         const datesStr = req.body.dates
    //         const types = req.body.types    
    //         const filter = req.body.filter
    //         const dates = datesStr.map(d => new Date(d))
    //         const data = []
    //         if(types.indexOf("totalbooking") > -1 && filter == 'bydate') {
    //             const counts = []         
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Booking.find({updatedAt:{$gte: startOfDay(dates[i]),$lt: endOfDay(dates[i])}}).count()
    //                 counts.push(count)
    //             }
    //             const totalBooking = {label: "Tổng số lịch hẹn theo ngày", data: counts}
    //             data.push(totalBooking)
    //         } else if (types.indexOf("totalbooking") > -1 && filter == 'bymonth') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Booking.find({updatedAt:{$gte: startOfMonth(dates[i]),$lt: endOfMonth(dates[i])}}).count()
    //                 counts.push(count)
    //             } 
    //             const totalBooking = {label: "Tổng số lịch hẹn theo tháng", data: counts}
    //             data.push(totalBooking)
    //         } else if (types.indexOf("totalbooking") > -1 && filter == 'byyear') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Booking.find({updatedAt:{$gte: startOfYear(dates[i]),$lt: endOfYear(dates[i])}}).count()
    //                 counts.push(count)
    //             } 
    //             const totalBooking = {label: "Tổng số lịch hẹn theo năm", data: counts}
    //             data.push(totalBooking)
    //         }
    //         if(types.indexOf("newcustomer") > -1 && filter == 'bydate') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) { 
    //                 const count = await Account.find({role: 'customer', createdAt:{$gte: startOfDay(dates[i]),$lt: endOfDay(dates[i])}}).count()
    //                 counts.push(count)   
    //             }
    //             const totalNewCus = {label: "Số khách hàng mới theo ngày", data: counts}
    //             data.push(totalNewCus)
    //         } else if(types.indexOf("newcustomer") > -1 && filter == 'bymonth') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Account.find({role: 'customer', createdAt:{$gte: startOfMonth(dates[i]),$lt: endOfMonth(dates[i])}}).count()    
    //                 counts.push(count)   
    //             }
    //             const totalNewCus = {label: "Số khách hàng mới theo tháng", data: counts}
    //             data.push(totalNewCus)
    //         } else if(types.indexOf("newcustomer") > -1 && filter == 'byyear') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Account.find({role: 'customer', createdAt:{$gte: startOfYear(dates[i]),$lt: endOfYear(dates[i])}}).count()    
    //                 counts.push(count)   
    //             }
    //             const totalNewCus = {label: "Số khách hàng mới theo năm", data: counts}
    //             data.push(totalNewCus)
    //         }
    //         if(types.indexOf("completedorder") > -1 && filter == 'bydate') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Order.find({status: 'Hoàn thành', updatedAt:{$gte: startOfDay(dates[i]),$lt: endOfDay(dates[i])}}).count()    
    //                 counts.push(count)
    //             }
    //             const totalCompleteOrder = {label: "Số đơn hoàn thành theo ngày", data: counts}
    //             data.push(totalCompleteOrder)
    //         } else if(types.indexOf("completedorder") > -1 && filter == 'bymonth') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Order.find({status: 'Hoàn thành', updatedAt:{$gte: startOfMonth(dates[i]),$lt: endOfMonth(dates[i])}}).count()    
    //                 counts.push(count)
    //             }
    //             const totalCompleteOrder = {label: "Số đơn hoàn thành theo tháng", data: counts}
    //             data.push(totalCompleteOrder)
    //         } else if(types.indexOf("completedorder") > -1 && filter == 'byyear') {
    //             const counts = []
    //             for (var i = 0; i < dates.length; i++) {
    //                 const count = await Order.find({status: 'Hoàn thành', updatedAt:{$gte: startOfYear(dates[i]),$lt: endOfYear(dates[i])}}).count()    
    //                 counts.push(count)
    //             }
    //             const totalCompleteOrder = {label: "Số đơn hoàn thành theo năm", data: counts}
    //             data.push(totalCompleteOrder)
    //         }
    //         res.status(200).json(data)
    //     } catch (err) {
    //         res.status(500).json(err)
    //     }
        
    // }
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

            const datas = {
                emptyRoom,
                newTicket,
                waitingTicket,
                newCompleteTicket,
                completeTicket,
                newFailTicket,
                failTicket
            }
            res.status(200).json(datas)
        } catch (err) {
            res.status(500).json(err)
        }
    }

}

module.exports = new ChartController()
