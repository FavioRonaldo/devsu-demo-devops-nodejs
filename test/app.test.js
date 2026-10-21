import request from 'supertest'
import { app } from '../app.js'
import sequelize from '../shared/database/database.js'

afterEach(() => {
    jest.restoreAllMocks()
})

afterAll(async () => {
    await sequelize.close()
})

describe('GET /health', () => {
    test('returns ok', async () => {
        const response = await request(app).get('/health')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'ok' })
    })
})

describe('GET /ready', () => {
    test('returns ready when the database is reachable', async () => {
        const response = await request(app).get('/ready')

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ status: 'ready' })
    })

    test('returns 503 when the database is unreachable', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {})
        jest.spyOn(sequelize, 'authenticate').mockRejectedValue(new Error('db down'))

        const response = await request(app).get('/ready')

        expect(response.status).toBe(503)
        expect(response.body).toEqual({ status: 'unavailable' })
    })
})

describe('error handling', () => {
    test('returns 404 for unknown routes', async () => {
        const response = await request(app).get('/unknown')

        expect(response.status).toBe(404)
        expect(response.body).toEqual({ error: 'Not found' })
    })

    test('returns 400 for a malformed JSON body', async () => {
        const response = await request(app)
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send('{"name": ')

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: 'Invalid JSON body' })
    })

    test('does not expose the framework', async () => {
        const response = await request(app).get('/health')

        expect(response.headers['x-powered-by']).toBeUndefined()
    })
})
