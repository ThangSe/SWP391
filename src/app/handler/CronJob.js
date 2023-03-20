const Bill = require("../models/Bill")
const Room = require("../models/Room")
const cron = require('node-cron')
const monthlyBill = cron.schedule('20 4 21 * *', async() => {
    const rooms = await Room.find().select('price').populate([{
        path: 'resident_id',
        model: 'account',
        select: 'user_id',
    }])
    const count = await Room.find().count()
    if(rooms) {
        const data = Array.from({ length: count } , () => ({ room_id: '', totalPrice: '', user_id: ''}))
        const formattedData = data.map((item, i) => ({...item, room_id: rooms[i].id, totalPrice: rooms[i].price, user_id: rooms[i].resident_id.user_id}))   
        const bills = await Bill.insertMany(formattedData)
        const data1 = Array.from({length: bills.length} , () => ({_id: '', bill_id: ''}))
        const formattedData1 = data1.map((item, i) => ({...item, _id: bills[i].room_id, bill_id: bills[i].id}))
        for(const data of formattedData1) {
            await Room.findByIdAndUpdate({_id: data._id}, { $push: { bill_id: data.bill_id } })
        }
        console.log("Run at " + new Date())   
    } else console.log("Not run at " + new Date())   
},
{
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
})

const job2 = cron.schedule('*/2 * * * * *', () => {
    console.log("2")
},
{
    scheduled: false,
    timezone: "Asia/Ho_Chi_Minh"
})

module.exports = {monthlyBill, job2}
