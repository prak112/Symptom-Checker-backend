async function buildRequestOptions(request, requestType) {
    console.log('Fetching token...');
    const token = await request.accessToken
    // console.log('Token: ', token);
    const requestOptions = {
        method: requestType,
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
    // console.log('Original request string : \n', requestString)

    const plusRegex = /\+/g;    // replace '+' with '%20' in query string
    const correctedRequestString = requestString.toString().replace(plusRegex, '%20');
    // console.log('Replaced request string : \n', correctedRequestString)

    // setup search request to endpoint
    const requestEndpoint = `${requestUrl}?${correctedRequestString}`;
    // console.log('Built request endpoint : \n', requestEndpoint)

    return requestEndpoint;
}


module.exports = { buildRequestOptions, buildRequestEndpoint }