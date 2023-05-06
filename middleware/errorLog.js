export default function errorLog(err, req, res, next) {
    const statusCode = res.statusCode ?? 500
    res.status(statusCode).json({
        message:
            statusCode === 500
                ? 'Server unable to process your request.'
                : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    })
}
