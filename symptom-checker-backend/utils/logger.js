const info = (...params) => {
    console.log(...params);
}

const error = (...params) => {
    console.error(...params);
}

// export to app
module.exports = { info, error }