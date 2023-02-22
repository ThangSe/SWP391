const {GridFsStorage} = require('multer-gridfs-storage')
const mongoose = require('mongoose')
const Grid = require('gridfs-stream')
const conn = mongoose.createConnection(process.env.DB_CONNECTION)
let gfs, gridfsBucket
conn.once('open', () => {
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
      })
    gfs = Grid(conn.db, mongoose.mongo)
    gfs.collection('uploads')
})
const storage = new GridFsStorage({
    url: process.env.DB_CONNECTION,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const filename = Date.now() + '-' + file.originalname
            const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
            }
            resolve(fileInfo)
        })
    }
    })
    const fileFind = async (filename) => {
        const file = await gfs.files.findOne({filename: filename})
        return file
    }
    const deletedFile = async (file) => {
        await gridfsBucket.delete(file._id)
    }
    const getImg = async (req, res) => {
        try {
            await gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
                // Check if file
                if (!file || file.length === 0) {
                  return res.status(404).json('Ảnh không tồn tại');
                }
                
                // Check if image
                if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
                  // Read output to browser
                  const readstream = gridfsBucket.openDownloadStream(file._id);
                  readstream.pipe(res)
                } else {
                  res.status(404).json('Không phải là ảnh')
                 }
                })
        } catch (err) {
            res.status(500).json(err)
        }
    }
module.exports = {storage, fileFind, deletedFile, getImg}
