// create variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);

// event to emit if db version changes
request.onupgradeneeded = function(event) {
  // save ref to db
  const db = event.target.result;
  db.createObjectStore('bankTransaction', { autoIncrement: true });
};

// if successful
request.onsuccess = function(event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  if (navigator.onLine) {
    uploadTransaction();
  }
};

request.onerror = function(event) {
  console.log('There was an error:', event.target.errorCode);
};

// execute if we try to submit transaction and we don't have internet
// called in catch of a fetch on index.js line 139
function saveRecord(record) {
  const transaction = db.transaction(['bankTransaction'], 'readwrite');
  const transactionObjectStore = transaction.objectStore('bankTransaction');
  transactionObjectStore.add(record);
};

function uploadTransaction() {
  // open transaction in db
  const transaction = db.transaction(['bankTransaction'], 'readwrite');

  // access object store
  const transactionObjectStore = transaction.objectStore('bankTransaction');

  // get all records from store, assign to var
  const getAll = transactionObjectStore.getAll();

  // upon successful getAll method execution
  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse);
        }
        // open another transaction
        const transaction = db.transaction(['bankTransaction'], 'readwrite');

        // access bankTransaction object store
        const transactionObjectStore = transaction.objectStore('bankTransaction');

        // use clear method on existing items in store
        transactionObjectStore.clear();

        alert('All saved offline transactions have been submitted.')
      })
      .catch(err => console.log(err));
    }
  }
};

// listen for app coming back online
window.addEventListener('online', uploadTransaction);