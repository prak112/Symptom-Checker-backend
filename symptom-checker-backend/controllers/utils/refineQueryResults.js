// Identify and handle ICD API Buggy URI in symptomChecker.js (Debug_Log issue 2)
/**
 * Sanitizes an array of URIs by removing any URIs that contain '&' and trimming the rest.
 * @param {string[]} foundationUrisArray - The array of URIs to be sanitized.
 * @returns {string[]} - The sanitized array of URIs.
 */
function sanitizeUrisArray(foundationUrisArray) {
    const cleanedUrisArray = []
    const buggyUrisArray = []
    for (let uri of foundationUrisArray) {
        if(uri && uri.includes('&')) {
            buggyUrisArray.push(uri)
            cleanedUrisArray.push(uri.split('&')[0].trim())
        }
        else if(uri) {
            cleanedUrisArray.push(uri)
        }
        else {
            buggyUrisArray.push(uri)
        }
    }
    console.log(`Foundation URI assesment :
        Buggy URIs : ${buggyUrisArray.length}
        Cleaned URIs : ${cleanedUrisArray.length}
    `)
    return cleanedUrisArray
}


// Filter NA records in lookupSearchData.js
/**
 * Filters out records from the original array based on the values in the detailsArray and urlsArray.
 * Records with 'NA' values in both detailsArray and urlsArray will be removed.
 * 
 * @param {Array} detailsArray - The array containing details values.
 * @param {Array} urlsArray - The array containing urls values.
 * @param {Array} originalArray - The original array to filter.
 * @returns {Array} - The filtered array without the removed records.
 */
function filterNARecords(detailsArray, urlsArray, originalArray) {
    // using Set for efficient lookup
    const recordsToRemove = new Set();
    const totalRecords = originalArray.length
    for (let i = 0; i < totalRecords; i++) {
        if (detailsArray[i] === 'NA' && urlsArray[i] === 'NA') {
            recordsToRemove.add(i);
        }
    }
    console.log('\nRecords To Remove : ', recordsToRemove.size);
    console.log(`Total Records :
        BEFORE : ${totalRecords}
        AFTER : ${totalRecords - recordsToRemove.size}
    `);

    // Array elements with indices in recordsToRemove are filtered-out iteratively
    const filteredArray = originalArray.filter((_, index) => !recordsToRemove.has(index))
    return filteredArray    
}


// Sort by 'score' in descending order in lookupSearchData.js
/**
 * Reorders an array based on the scores in another array.
 * 
 * @param {Array} originalArray - The original array to be reordered.
 * @param {Array} filteredScoresArray - The array containing the scores used for reordering.
 * @returns {Array} - The reordered array.
 */
function reorderArray(originalArray, filteredScoresArray) {
    // Setup sorted indices order based on 'filteredScores'
    // pair score and index of filteredScores
    const indexedScores = filteredScoresArray.map((score, index) => ({ score, index }))
    const sortedFilteredScores = indexedScores.sort((a, b) => (+(b.score)*100) - (+(a.score)*100))
    const sortedScoresIndices = sortedFilteredScores.map(pair => pair.index)
    console.log('Total Sorted Indices : ', sortedScoresIndices.length);

    // prevent complications from different lengths
    const referenceArrayLength = filteredScoresArray.length
    originalArray.splice(referenceArrayLength)
    // sort originalArray into empty array  
    const reorderedArray = new Array(referenceArrayLength)
    sortedScoresIndices.forEach((sortedIndex, currentIndex) => {
        reorderedArray[currentIndex] = originalArray[sortedIndex]
    })
    return reorderedArray
}


module.exports = {
    sanitizeUrisArray,
    filterNARecords,
    reorderArray
}