exports.clearUserSession = (request, response) => {
    try {
        // Clear cookies
        response.clearCookie('auth_token');

        return response.status(204).send()
    } catch (error) {
        console.error('Error during User session invalidation : ', error)
        
        return response
            .status(500)
            .json({ error: 'Internal Server Error handling User log out.' })
    }
}
