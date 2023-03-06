require('dotenv').config()
const authRouter = require('./auth')
const accountRouter = require('./account')
const ticketRouter = require('./ticket')
const postRouter = require('./post')

function route(app) {
    app.use('/auth', authRouter)
    app.use('/account', accountRouter)
    app.use('/ticket', ticketRouter)
    app.use('/post', postRouter)
    app.use((req, res, next) => {
        res.status(404)
        res.json({
            status:404,
            message: 'Not found!'
        })
    })
    app.use((err, req, res, next) => {
        res.status(err.status || 500)
        res.json({
            status: err.status || 500,
            message: err.message
        })
    })
}

module.exports = route
