const multer = require('multer')
const stream = require('stream')
const cloudinary = require('cloudinary')

process.env.CLOUDINARY_URL = process.env.CLOUDINARY_URL || 'cloudinary://128921818286993:PGXgcFhrcOxS3d7AnwURD0G-I_k@hemo2estt'

if (!process.env.CLOUDINARY_URL) {
    process.exit(1)
}

const doUpload = (publicId, req, res, next) => {

    const uploadStream = cloudinary.uploader.upload_stream(function (result) {
        req.fileurl = result.url
        req.fileid = result.public_id
        next()
    }, { public_id: req.body[publicId] })

    const s = new stream.PassThrough()
    s.end(req.file.buffer)
    s.pipe(uploadStream)
    s.on('end', uploadStream.end)
}

const uploadImage = (publicId) => (req, res, next) =>
    multer().single('image')(req, res, function () {
        doUpload(publicId, req, res, next)
    })

module.exports = uploadImage
