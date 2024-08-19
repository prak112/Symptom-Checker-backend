# 1 - Complications in choosing `topResult` candidate
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
<br>
