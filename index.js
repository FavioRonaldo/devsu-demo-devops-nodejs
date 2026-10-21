import sequelize from './shared/database/database.js'
import { config } from './shared/config.js'
import { app } from './app.js'

try {
    await sequelize.sync()
    console.log('db is ready')
} catch (error) {
    console.error('Unable to connect to the database', { error: error.message })
    process.exit(1)
}

const server = app.listen(config.port, () => {
    console.log('Server running on port', config.port)
})

const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`)
    setTimeout(() => process.exit(1), config.shutdownTimeoutMs).unref()
    server.close(async () => {
        await sequelize.close()
        process.exit(0)
    })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
