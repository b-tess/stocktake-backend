//Create a middleware function that wraps around the route handlers in the app
export default function errorHandler(routeHandler) {
    return async (req, res, next) => {
        try {
            routeHandler(req, res)
        } catch (error) {
            next(error)
        }
    }
}
