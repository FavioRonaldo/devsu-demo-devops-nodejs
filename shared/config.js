import 'dotenv/config'

const env = process.env

const toInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? fallback : parsed
}

export const config = {
    port: toInt(env.PORT, 8000),
    shutdownTimeoutMs: toInt(env.SHUTDOWN_TIMEOUT_MS, 10000),
    database: {
        dialect: env.DATABASE_DIALECT ?? 'sqlite',
        name: env.DATABASE_NAME ?? './dev.sqlite',
        user: env.DATABASE_USER,
        password: env.DATABASE_PASSWORD,
        host: env.DATABASE_HOST ?? 'localhost',
        port: toInt(env.DATABASE_PORT, 5432),
        logging: env.DATABASE_LOGGING === 'true',
    },
}
