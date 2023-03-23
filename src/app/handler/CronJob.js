const Bill = require("../models/Bill")
const Room = require("../models/Room")
const cron = require('node-cron')
const monthlyBill = cron.schedule('1 0 1 * *', async() => {
    const date = new Date()
    const rooms = await Room.find({}).select('price').populate([{
        path: 'resident_id',
        model: 'account',
        select: 'user_id',
    }])
    const count = await Room.find({status:{$ne: "Còn trống"}}).count()
    if(rooms) {
        const data = Array.from({ length: count } , () => ({ room_id: '', totalPrice: '', user_id: ''}))
        const formattedData = data.map((item, i) => ({...item, room_id: rooms[i].id, totalPrice: rooms[i].price, user_id: rooms[i].resident_id.user_id}))   
        const bills = await Bill.insertMany(formattedData)
        const data1 = Array.from({length: bills.length} , () => ({_id: '', bill_id: ''}))
        const formattedData1 = data1.map((item, i) => ({...item, _id: bills[i].room_id, bill_id: bills[i].id}))
        for(const data of formattedData1) {
            await Room.findByIdAndUpdate({_id: data._id}, { $push: { bill_id: data.bill_id } })
        }
        console.log("Run at " + date)   
    } else console.log("Not run at " + date)   
},
{
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
})

const expBill = cron.schedule('1 0 1 * *', async () => {
    const date = new Date()
    await Bill.updateMany({dueDate: {$lt: date}, status: 'Chưa thanh toán'}, {status: 'Quá hạn'})
    console.log("Cập nhật hóa đơn quá hạn ngày" + date)
},
{
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
})

module.exports = {monthlyBill, expBill}
