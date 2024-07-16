function buildRequestOptions() {
    console.log('Fetching token...');
    console.log('Token: ', token);
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'API-Version': 'v2',
            'Accept-Language': 'en',
            'Accept': 'application/json'
        }
    };
    return requestOptions;
}

function buildRequestEndpoint(requestParams, requestUrl) {
    const requestString = new URLSearchParams(requestParams);

    // setup search request to endpoint
    const requestEndpoint = `${requestUrl}?${requestString}`;
    return requestEndpoint;
}


module.exports = { buildRequestOptions, buildRequestEndpoint }