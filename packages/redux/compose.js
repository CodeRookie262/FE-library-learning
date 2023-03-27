export default (...middleware) => {
    return middleware.reduce((memo, callback) => (...args) => memo(callback(...args)))
}