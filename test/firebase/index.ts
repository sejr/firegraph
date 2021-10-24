const FirestoreMock = require('firestore-mock')
const _firestore = new FirestoreMock()

// seed data into mock firebase

/**
 * Users Collection
 */
var uRef1 = _firestore.collection('users').doc('Beeb3V4VvUdY79imRS1f').set({
  'fullname': 'John Doe',
  'favouriteColor': 'green',
  'hobbies': ['reading', 'cooking', 'coding', 'music']
});
var uRef2 = _firestore.collection('users').doc('PBQ4JosAROuqa3YgQrBR').set({
  'fullname': 'Leonard M. Bailey',
  'favouriteColor': 'blue',
  'hobbies': ['dancing', 'gaming', 'piano', 'music']
});
var uRef3 = _firestore.collection('users').doc('U7prtqicwDUSKgasXXNv').set({
  'fullname': 'Leonard M. Bailey',
  'favouriteColor': 'blue',
  'hobbies': ['coding', 'skateboarding', 'sketching']
});
var uRef4 = _firestore.collection('users').doc('kbpjZl0PJstgAPLmypWh').set({
  'fullname': 'Leila Jones',
  'favouriteColor': 'red',
  'hobbies': ['cooking', 'gaming', 'piano']
});

/**
 * Posts collection
 */

var postRef1 = _firestore.collection('posts').add({
  'author': uRef1.ref,
  'authorId': uRef1.id,
  'score': 25,
  'likes': [
    uRef1.id,
    uRef2.id,
    uRef3.id,
  ],
  'message': 'hello world',
  'category': 'general',
});
var postRef2 = _firestore.collection('posts').add({
  'author': uRef1.ref,
  'authorId': uRef1.id,
  'score': 22,
  'likes': [
    uRef1.id,
    uRef2.id,
    uRef4.id,
  ],
  'message': 'Second Post',
  'category': 'general'
});
var postRef3 = _firestore.collection('posts').add({
  'author': uRef2.ref,
  'authorId': uRef2.id,
  'score': 25,
  'likes': [
    uRef1.id,
    uRef3.id,
    uRef4.id,
  ],
  'message': 'This is awesome',
  'category': 'technology'
});
var postRef4 = _firestore.collection('posts').add({
  'author': uRef3.ref,
  'authorId': uRef3.id,
  'score': 45,
  'likes': [
    uRef3.id,
    uRef2.id,
    uRef4.id,
  ],
  'message': 'Awesome Gadgets to try',
  'category': 'technology'
});
var postRef5 = _firestore.collection('posts').add({
  'author': uRef4.ref,
  'authorId': uRef4.id,
  'score': 11,
  'likes': [
    uRef1.id,
    uRef2.id,
  ],
  'message': 'How to beat your meat perfectly',
  'category': 'cooking'
});

/**
 * Comments sub-collection
 */
postRef1.ref.collection('comments').add({
  'author': uRef4.ref,
  'authorId': uRef4.id,
  'comment': 'Hello!'
})
postRef4.ref.collection('comments').add({
  'author': uRef1.ref,
  'authorId': uRef1.id,
  'comment': 'Coooool'
})
postRef4.ref.collection('comments').add({
  'author': uRef2.ref,
  'authorId': uRef2.id,
  'comment': '2nd One is the best'
})
postRef4.ref.collection('comments').add({
  'author': uRef4.ref,
  'authorId': uRef4.id,
  'comment': 'Innovative stuff'
})
postRef5.ref.collection('comments').add({
  'author': uRef1.ref,
  'authorId': uRef1.id,
  'comment': 'Dayum'
})

export default _firestore;
export const firestore = _firestore;