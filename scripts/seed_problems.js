const { readFileSync } = require('fs');

console.log("To insert 500+ problems into your Firebase Firestore:");
console.log("1. Add a service account key from your Firebase Console to codearena/service-account.json");
console.log("2. Run: npm install firebase-admin");
console.log("3. Populate a local JSON file (e.g. problems.json) with an array of Problem objects.");
console.log("4. Use the following script logic to upload them in batches:");

const script = `
const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadProblems() {
  const problems = JSON.parse(readFileSync('./problems.json', 'utf-8'));
  const batch = db.batch();
  
  console.log(\`Uploading \${problems.length} problems...\`);
  let count = 0;
  
  for (const p of problems) {
    const docRef = db.collection('problems').doc(p.id);
    batch.set(docRef, p);
    count++;
    
    // Firestore batches have a limit of 500 operations
    if (count % 450 === 0) {
      await batch.commit();
      console.log('Committed batch');
    }
  }
  
  if (count % 450 !== 0) {
    await batch.commit();
  }
  
  console.log('Upload complete! 500+ problems imported.');
}

uploadProblems().catch(console.error);
`;

console.log(script);
