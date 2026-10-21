import request from 'supertest'
import { app } from '../app.js'
import sequelize from '../shared/database/database.js'
import User from '../users/model.js'

const data = { dni: '1234567890', name: 'Test' }

beforeAll(async () => {
    await sequelize.sync({ force: true })
})

beforeEach(async () => {
    await User.destroy({ truncate: true })
})

afterEach(() => {
    jest.restoreAllMocks()
})

afterAll(async () => {
    await sequelize.close()
})

const silenceErrors = () => jest.spyOn(console, 'error').mockImplementation(() => {})

describe('GET /api/users', () => {
    test('returns an empty list when there are no users', async () => {
        const response = await request(app).get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toEqual([])
    })

    test('returns the stored users', async () => {
        await User.create(data)

        const response = await request(app).get('/api/users')

        expect(response.status).toBe(200)
        expect(response.body).toEqual([{ ...data, id: expect.any(Number) }])
    })

    test('returns 500 when the database fails', async () => {
        silenceErrors()
        jest.spyOn(User, 'findAll').mockRejectedValue(new Error('db down'))

        const response = await request(app).get('/api/users')

        expect(response.status).toBe(500)
        expect(response.body).toEqual({ error: 'Internal Server Error' })
    })
})

describe('GET /api/users/:id', () => {
    test('returns the user', async () => {
        const user = await User.create(data)

        const response = await request(app).get(`/api/users/${user.id}`)

        expect(response.status).toBe(200)
        expect(response.body).toEqual({ ...data, id: user.id })
    })

    test('returns 404 when the user does not exist', async () => {
        const response = await request(app).get('/api/users/999')

        expect(response.status).toBe(404)
        expect(response.body).toEqual({ error: 'User not found: 999' })
    })

    test('returns 400 when the id is not a number', async () => {
        const response = await request(app).get('/api/users/abc')

        expect(response.status).toBe(400)
        expect(response.body.errors).toEqual([
            expect.objectContaining({ path: 'params.id' }),
        ])
    })

    test('returns 500 when the database fails', async () => {
        silenceErrors()
        jest.spyOn(User, 'findByPk').mockRejectedValue(new Error('db down'))

        const response = await request(app).get('/api/users/1')

        expect(response.status).toBe(500)
    })
})

describe('POST /api/users', () => {
    test('creates a user', async () => {
        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(201)
        expect(response.body).toEqual({ ...data, id: expect.any(Number) })
        expect(await User.count()).toBe(1)
    })

    test('returns 400 when required fields are missing', async () => {
        const response = await request(app).post('/api/users').send({})

        expect(response.status).toBe(400)
        expect(response.body.errors.map(({ path }) => path).sort()).toEqual(['body.dni', 'body.name'])
    })

    test('returns 400 when the dni already exists', async () => {
        await User.create(data)

        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(400)
        expect(response.body).toEqual({ error: `User already exists: ${data.dni}` })
    })

    test('returns 500 when the database fails', async () => {
        silenceErrors()
        jest.spyOn(User, 'findOne').mockRejectedValue(new Error('db down'))

        const response = await request(app).post('/api/users').send(data)

        expect(response.status).toBe(500)
    })
})
