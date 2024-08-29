# Features :
- [Grouped Search Results](#grouped-search-results)
- [User Histrory]()
- [End-to-End Encryption](#end-to-end-encryption)
- [Geolocation APIs](#geolocation-apis)
- [Triage System](#triage-system)
- [Intelligent I/O Simplification](#intelligent-io-simplification)

<hr>
<hr>
<br>

## Grouped Search Results
- GitHub Issue [#3](https://github.com/prak112/Symptom-Checker-backend/issues/3)

<hr>
<br>

## User History
- GitHub Issue [#12](https://github.com/prak112/Symptom-Checker-backend/issues/12)

<hr>
<br>

## End-to-End Encryption
- GitHub Issue [#4](https://github.com/prak112/Symptom-Checker-backend/issues/4)
- To provide users the option to use the services as a registered user/guest user, the user input data needs to be encrypted and decrypted at request/to provide service.
- **Session IDs** provide the possibility to act as an encryption key to securely store the encrypted user input data (in this case, Symptoms)


### Session ID to encrypt user input
1. *Create Middleware to Generate Session ID*: 
    - When a user accesses the service, generate a unique session ID.
    - Import the middleware to generate a session ID and attach it to the request object.

2. *Use Encryption in Routes*:
    - Use the session ID to encrypt and decrypt data in the routes.

3. *Use the Session ID as the Encryption Key*: 
    - Use this session ID to encrypt the user input data.

4. *Store the Encrypted Data*: 
    - Store the encrypted data securely.

5. *Decrypt Data on Request*: 
    - When the user needs to access the data, use the session ID to decrypt it.


### Encrypt Session ID for secure storage
- *Setup DB_SECRET in .env*:
    - Define the DB_SECRET in .env file or environment configuration.
- *Encrypt Data*:
    - Use the DB_SECRET to encrypt user input data and session IDs before storing them in the database.
- *Decrypt Data*:
    - Use the DB_SECRET to decrypt the data when needed.

- For secure key management, rotation of `DB_SECRET` variable in the local environment can be achieved as follows: 
1. *Generate a New Key*:
    - Generate a new encryption key and update the DB_SECRET environment variable.

2. *Re-encrypt Existing Data*:
    - Retrieve all existing encrypted data from the database.
    - Decrypt the data using the old key.
    - Encrypt the data using the new key.
    - Update the database with the newly encrypted data.

3. *Update the Environment Variable*:
    - Update the DB_SECRET in .env file or environment configuration.

4. *Deploy the Changes*:
    - Deploy the updated environment configuration to all environments (development, staging, production)

<hr>
<br>

## Geolocation APIs
- GitHub Issue [#5](https://github.com/prak112/Symptom-Checker-backend/issues/5)

<hr>
<br>

## Triage System
- GitHub Issue [#6](https://github.com/prak112/Symptom-Checker-backend/issues/6)

<hr>
<br>

## Intelligent I/O Simplification
- GitHub Issue [#7](https://github.com/prak112/Symptom-Checker-backend/issues/7)
