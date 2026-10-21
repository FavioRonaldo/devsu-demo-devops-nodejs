import express from 'express'
import sequelize from './shared/database/database.js'
import { usersRouter } from './users/router.js'
import { notFound, errorHandler } from './shared/middleware/errorHandler.js'

const app = express()

app.disable('x-powered-by')
app.use(express.json())

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' })
})

app.get('/ready', async (req, res) => {
    try {
        await sequelize.authenticate()
        res.status(200).json({ status: 'ready' })
    } catch (error) {
        console.error('ready() -> database unavailable', { error: error.message })
        res.status(503).json({ status: 'unavailable' })
    }
})

app.use('/api/users', usersRouter)
app.use(notFound)
app.use(errorHandler)

export { app }
