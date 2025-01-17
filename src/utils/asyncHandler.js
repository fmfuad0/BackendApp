const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        // Ensure any promise rejection or thrown error is caught and passed to the next middleware
        Promise.resolve(requestHandler(req, res, next))
            .catch(next);  // Automatically passes the error to Express's error handler
    };
};

export { asyncHandler };
