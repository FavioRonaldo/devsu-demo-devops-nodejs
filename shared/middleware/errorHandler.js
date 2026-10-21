export const notFound = (req, res) => {
    res.status(404).json({ error: 'Not found' })
}

export const errorHandler = (error, req, res, _next) => {
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ error: 'Invalid JSON body' })
    }
    console.error('app() -> unhandled', { error })
    return res.status(500).json({ error: 'Internal Server Error' })
}
