import { errorHandler } from '../shared/middleware/errorHandler.js'

jest.mock('dotenv/config', () => ({}))

const ENV_KEYS = [
    'PORT', 'SHUTDOWN_TIMEOUT_MS', 'DATABASE_DIALECT', 'DATABASE_NAME', 'DATABASE_USER',
    'DATABASE_PASSWORD', 'DATABASE_HOST', 'DATABASE_PORT', 'DATABASE_LOGGING',
]
const originalEnv = { ...process.env }

const withEnv = (vars, loader) => {
    ENV_KEYS.forEach((key) => delete process.env[key])
    Object.assign(process.env, vars)
    let loaded
    jest.isolateModules(() => {
        loaded = loader()
    })
    return loaded
}

afterEach(() => {
    process.env = { ...originalEnv }
    jest.restoreAllMocks()
})

describe('config', () => {
    const loadConfig = () => require('../shared/config.js').config

    test('uses safe defaults when no variables are defined', () => {
        const config = withEnv({}, loadConfig)

        expect(config.port).toBe(8000)
        expect(config.shutdownTimeoutMs).toBe(10000)
        expect(config.database).toEqual(expect.objectContaining({
            dialect: 'sqlite',
            name: './dev.sqlite',
            host: 'localhost',
            port: 5432,
            logging: false,
        }))
    })

    test('reads every value from the environment', () => {
        const config = withEnv({
            PORT: '3000',
            DATABASE_DIALECT: 'postgres',
            DATABASE_NAME: 'users',
            DATABASE_USER: 'app',
            DATABASE_PASSWORD: 'secret',
            DATABASE_HOST: 'postgres',
            DATABASE_PORT: '6543',
            DATABASE_LOGGING: 'true',
        }, loadConfig)

        expect(config.port).toBe(3000)
        expect(config.database).toEqual({
            dialect: 'postgres',
            name: 'users',
            user: 'app',
            password: 'secret',
            host: 'postgres',
            port: 6543,
            logging: true,
        })
    })

    test('falls back to the default when a number is invalid', () => {
        const config = withEnv({ PORT: 'not-a-number' }, loadConfig)

        expect(config.port).toBe(8000)
    })
})

describe('database', () => {
    const loadDatabase = () => require('../shared/database/database.js').default

    test('connects to postgres with the configured credentials', async () => {
        const sequelize = withEnv({
            DATABASE_DIALECT: 'postgres',
            DATABASE_NAME: 'users',
            DATABASE_USER: 'app',
            DATABASE_PASSWORD: 'secret',
            DATABASE_HOST: 'db.internal',
            DATABASE_LOGGING: 'true',
        }, loadDatabase)

        expect(sequelize.getDialect()).toBe('postgres')
        expect(sequelize.config).toEqual(expect.objectContaining({
            database: 'users',
            username: 'app',
            password: 'secret',
            host: 'db.internal',
            port: 5432,
        }))
        expect(sequelize.options.logging).toBe(console.log)
        await sequelize.close()
    })

    test('uses the database name as the sqlite storage', async () => {
        const sequelize = withEnv({ DATABASE_NAME: ':memory:' }, loadDatabase)

        expect(sequelize.getDialect()).toBe('sqlite')
        expect(sequelize.options.storage).toBe(':memory:')
        expect(sequelize.options.logging).toBe(false)
        await sequelize.close()
    })
})

describe('errorHandler', () => {
    const mockResponse = () => {
        const res = {}
        res.status = jest.fn(() => res)
        res.json = jest.fn(() => res)
        return res
    }

    test('returns 500 for unexpected errors', () => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
        const res = mockResponse()

        errorHandler(new Error('boom'), {}, res, jest.fn())

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' })
    })
})
