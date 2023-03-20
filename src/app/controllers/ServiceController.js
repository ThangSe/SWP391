const Account = require("../models/Account")
const Service = require("../models/Service")
const Buffer = require('buffer').Buffer
const multer = require('multer')
const {storage, fileFind, deletedFile} = require('../../config/db/upload')

class RoomController {
    async showAllService (req, res) {
        try {
            const {page = 1, limit = 10, sort = 1, supplier, type, price, status, name} = req.query
            const filter = {
                status: status,
                type: type,
                price: price,
                supplier: supplier,
                name: { $regex: name, $options: 'i'}
            }
            if(!status) filter.status = {$ne:null}
            if(!type) filter.type = {$ne:null}
            if(!price) filter.price = {$ne:null}
            if(!supplier) filter.supplier = {$ne:null}
            if(!name) filter.name = {$ne:null}
            const services = await Service.find(filter).sort({_id:sort}).limit(limit * 1).skip((page - 1) * limit)
            const count = await Service.find(filter).count()/limit
            return res.status(200).json({count: Math.ceil(count), services})
        } catch (err) {
            res.status(500).json(err)
        }
    }

    async createService(req, res) {
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
                    const service = new Service(data)
                    const saveService = await service.save()
                    const URLs = req.files.map(file => "https://aprartment-api.onrender.com/service/image/"+file.filename)
                    await Service.findByIdAndUpdate({_id: saveService.id}, {$push: {imgURLs: {$each: URLs}}}, {new: true})
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

    async updateService(req, res) {
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
                const service = await Service.findById(req.params.id)
                const data = JSON.parse(req.body.data)
                if(req.files.length > 0) {
                    if(service.imgURLs.length > 0){
                        for (var i = 0; i<service.imgURLs.length; i++){
                            const filename = service.imgURLs[i].replace("https://aprartment-api.onrender.com/service/image/","")
                            const file = await fileFind(filename)
                            if(file){
                                await deletedFile(file)
                            }
                        }        
                    }
                    await service.updateOne({$set: data})
                    const URLs = req.files.map(file => "https://aprartment-api.onrender.com/service/image/"+file.filename)
                    await service.updateOne({$push: {imgURLs: {$each: URLs}}})
                    res.status(200).json("Cập nhật thành công")
                }   
                else {
                    await service.updateOne({$set: data})
                    res.status(200).json("Cập nhật thành công")
                }
            })
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
