# Issues-Solutions
<br>

- [1 - ICD API Authentication automation](#1---icd-api-authentication-automation)
- [2 - Complications in choosing `topResult` candidate](#2---complications-in-choosing-topresult-candidate)
- [3 - ICD API Buggy `foundationUri`](#3---icd-api-buggy-foundationuri)
    - [3.1 - Complication from Buggy `foundationUri`](#31---complication-from-buggy-foundationuri)
- [4 - `diagnosisData` Schema complication](#4---diagnosisdata-schema-complication)
- [5 - Database Controller and Middleware Setup](#5---database-controller-and-middleware-setup)

<br>
<hr>
<hr>
<br>

# 1 - ICD API Authentication automation
- **Context**:
	- ICD has an OAUTH 2.0 Server for API Authentication. 
	- OAUTH 2.0 authenticates an API user and sends a `Bearer` access token with an `expires_in` limit of 3600 seconds (1 hour)
- **Reason**:
	- To setup an automated API Authentication Controller to call the `authenticateApiAccess` utility function every 1 hour (`expires_in` limit)
	- To reduce overhead on the application requests
    - To keep ICD API OAUTH 2.0 server usage only when required.
- **Solution**:
	- Workflow to build automated token renewal : 

    ```mermaid
    graph TD
    A[Application startup] --> B[icdAuthController]
    style A fill:#A00F
    style B fill:#00FF
    B --> C[apiAuthenticator.authenticateApiAccess]
    C --> D[POST/ tokenEndpoint, tokenOptions]
    D --> E[apiAuthenticator.fetchToken]
    E --> F[update tokenInfo object]
    F --> G[Setup renewal schedule through tokenInfo.updateTimeout]
    G --> H[return tokenInfo.accessToken]
    H --> B
    ```
    <br>

    - Example token data : 
    ```javascript
        {
            access_token: 'eyJhbGciOiJSUzI1NiIsXVYsImV4cCI6MT......',
            expires_in: 3600,
            token_type: 'Bearer'
        }
    ```

<hr>
<hr>
<br>


# 2 - Complications in choosing `topResult` candidate
- **Context** : 
    - To display the `topResult` it was planned to filter by `score`.
    - For a recent symptom search ('backpain'), the top scoring result had an 'unspecified' URL, i.e., there was no information for neither quick read nor further read.
- **Solution** :
    - APPROACH 1 : Consider the following for each `label`,
        1. Are there duplicates ? i.e., are `score`, `title`, `detail` and `url` the same ?
            1.1. If yes, keep single record and remove duplicates
            1.2. If no, is `score` the highest ?
        - Remove duplicates at data crawl for `searchDataOutput` `object`
        2. If `score` is highest, is `detail` and `url` same ?
            2.1 If yes, keep original and remove duplicates
            2.2 If no, select as `topResult`

<hr>
<hr>
<br>

# 3 - ICD API Buggy `foundationUri`
- **Context** :
    - For 'knee pain' or 'knee joint pain' symptom Search query on https://id.who.int/icd/release/11/2024-01/mms/search sometimes returns 2 `foundationUri`s joined by '&'. 
    - For instance as follows :
     `'http://id.who.int/icd/entity/9272848 & http://id.who.int/icd/entity/1574110781'`
    - This bug threw up while running the API `lookup` query using `foundationUri`
- **Solution** : 
    - INSTEAD of *Splitting*, *Slicing* by the delimiter `&` 
    - Select the 1st URI, Trim spaces and `push` the cleaned URI to `cleanedUrisArray` 
    - Expected consequences from Splitting :
        - to deal with = **2 * n+ items in 'url', 'title', 'detail'** where *n = total number of buggy* `foundationUri`s
    - Expected consequences from *Slicing* :
        - Loss of an additional URI. 
        - However without a relevant label and score, it is useless.
        - Issue 2.1 (below) is resolved.

<hr>

## 3.1 - Complication from Buggy `foundationUri`
- **Context** :
    - Procedure to sort 'score' in descending order results in unexpected complication
    - Procedure is as follows :
        * sort `filteredScores` by pairing `{score, index}` as `sortedFilteredScores`
        * get the sorted indices from `sortedFilteredScores`
        * reorder the rest of the filtered arrays based on the sorted indices of `sortedFilteredScores`
    - Resulting Complications :
        * Total records from `searchQueryOutput`(`label`, `score`) !== `lookupData`(`url`, `title`, `detail`)
            * Above complication only happens for certain symptoms (ex. knee pain, knee joint pain)
            * DUE to Buggy-foundationUri Issue from ICD API
        * However, frontend ONLY renders the lowest number, i.e., searchQueryOutput record count
        * As long as record count in `searchQueryOutput` < `lookupData`, No issues will be found.
- **Solution** :
    - *Slicing* the Buggy Uri string INSTEAD of *Splitting*.

<hr>
<hr>
<br>

# 4 - `diagnosisData` Schema complication
- `diagnosisDataArray` the final outcome of `symptomChecker` Controller is sent as server response and stored in Database
- `mongooose`, the MongoDB ODM (Object Document Modeling) tool requires (also a good practice) to have a schema for the *Document* being saved in the MongoDB *Collection*
- Complication arises from the data structure for `diagnosisData`:
```javascript
    // structure of processed search and lookup data
    diagnosisDataArray = [
        {
            symptom: string,
            topResult: {
                label: string,
                score: number,
                title: string,
                detail: string,
                url: string
            },
            includedResults: {
                label: [string],
                score: [number],
                url: [string]
            },
            excludedResults: {
                label: [string],
                score: [number],
                url: [string]
            }
                
        }, 
        {
            symptom: string,
            topResult: {
                label: string,
                score: number,
                title: string,
                detail: string,
                url: string
            },
            includedResults: {
                label: [string],
                score: [number],
                url: [string]
            },
            excludedResults: {
                label: [string],
                score: [number],
                url: [string]
            }
        },
    ...
    ]
```
- Hence, the schema was to be built in steps, by starting from the smallest structure (Sub-Schemas) to the final structure (Main Schema)
- The simple idea that slipped my mind was --
    - every `object` must be defined in a schema and 
    - `array` in a symbolic representation with type of data it holds.

```javascript
    // imports
    ...

    // Sub-Schemas
    const resultSchema = new Schema({
        label: [String],
        score: [Number],
        url: [String]
    });

    const topResultSchema = new Schema({
        label: String,
        score: Number,
        title: String,
        detail: String,
        url: String
    });

    const diagnosisDataSchema = new Schema({
        symptom: { type: String, required: true },
        topResult: { type: topResultSchema, required: true },
        includedResults: { type: resultSchema, required: true },
        excludedResults: { type: resultSchema, required: true }
    });

    const diagnosisArraySchema = new Schema({
        diagnosis: { type: [diagnosisDataSchema], required: true },
        ...
    })

    ...
```


<hr>
<hr>
<br>


# 5 - Database Controller and Middleware Setup
- *Minor Issue*
    - **Middleware** - Did not update to `config.USER_SECRET` variable from `config.SECRET`
- *Solution*
    - Dig down the rabbit hole and update in `middleware.userExtractor`
<hr>

- *MAJOR Issue*
    - **Controller** -  Calling `user._id` instead of `user.id` to save the diagnosis in the `Symptom` object
- *Solution*
    - Had to setup `userAuth.js` utility file to handle authentication and set cookies in response.
    - These response cookies were handled by `middleware.tokenExtractor` and `middleware.userExtractor` to identify and setup the User in `request.user`
    - Thus, enabling `symptomChecker` Controller to retrieve user from request header to be passed down to `data` Controller for data storage (session/user history).
<hr>

- *MAJOR Issue*
    - **Utilities** - In `userAuth.setAuthToken` the `maxAge` property units were misunderstood to be seconds instead of milliseconds, causing immediate token expiry
- *Solution*
    - Sudden realization while debugging
    ```javascript
    ...
        response.cookie('auth_token', token, {
        ...
        maxAge: 2 * 60 * 60 * 1000, // match token expiresIn (milliseconds)
        ...
    })
    ...
    ```

<hr>
<hr>
<br>
