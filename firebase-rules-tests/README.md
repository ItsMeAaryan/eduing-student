# Security rules tests

Checks `../firestore.rules` against the Firebase emulators
(needs Java 11+). Run before every `firebase deploy --only firestore:rules`.

```
cd firebase-rules-tests
npm install
npm test
```
