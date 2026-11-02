# Security rules tests

Checks `../firestore.rules` and `../storage.rules` against the Firebase emulators
(needs Java 11+). Run before every `firebase deploy --only firestore:rules,storage`.

```
cd firebase-rules-tests
npm install
npm test
```
