/**
 * =========================================================================
 * 1. CUSTOM DATA STRUCTURES (USING FUNCTIONS & OBJECTS)
 * =========================================================================
 */

let hashTableSize = 50;

function createEmptyHashTable() {
    let table = new Array(hashTableSize);
    for (let i = 0; i < hashTableSize; i++) {
        table[i] = [];
    }
    return table;
}

function calculateHash(key) {
    let total = 0;
    let keyString = String(key);
    for (let i = 0; i < keyString.length; i++) {
        total += keyString.charCodeAt(i);
    }
    return total % hashTableSize;
}

function insertIntoTable(targetTable, key, value) {
    let index = calculateHash(key);
    let bucket = targetTable[index];
    for (let i = 0; i < bucket.length; i++) {
        if (bucket[i][0] === key) {
            bucket[i][1] = value;
            return;
        }
    }
    bucket.push([key, value]);
}

function searchInTable(targetTable, key) {
    let index = calculateHash(key);
    let bucket = targetTable[index];
    for (let i = 0; i < bucket.length; i++) {
        if (String(bucket[i][0]) === String(key)) {
            return bucket[i][1];
        }
    }
    return null;
}

function getTableValuesAsArray(targetTable) {
    let list = [];
    for (let i = 0; i < hashTableSize; i++) {
        for (let j = 0; j < targetTable[i].length; j++) {
            list.push(targetTable[i][j][1]);
        }
    }
    return list;
}

function createLinkedList() {
    return { head: null };
}

function addNodeAtStart(listObject, text, time = new Date().toLocaleTimeString()) {
    let newNode = { text: text, time: time, next: null };
    if (listObject.head === null) {
        listObject.head = newNode;
    } else {
        newNode.next = listObject.head;
        listObject.head = newNode;
    }
}

function convertLinkedListToArray(listObject) {
    let arr = [];
    let current = listObject.head;
    while (current !== null) {
        arr.push({ text: current.text, time: current.time });
        current = current.next;
    }
    return arr;
}

function createWaitlistQueue() {
    return { front: null, rear: null };
}

function enqueueMember(queueObject, memberId) {
    let newNode = { memberId: memberId, next: null };
    if (queueObject.rear === null) {
        queueObject.front = queueObject.rear = newNode;
        return;
    }
    queueObject.rear.next = newNode;
    queueObject.rear = newNode;
}

function dequeueMember(queueObject) {
    if (queueObject.front === null) return null;
    let removedNode = queueObject.front;
    queueObject.front = queueObject.front.next;
    if (queueObject.front === null) queueObject.rear = null;
    return removedNode.memberId;
}

function convertQueueToArray(queueObject) {
    let list = [];
    let current = queueObject.front;
    while (current !== null) {
        list.push(current.memberId);
        current = current.next;
    }
    return list;
}

/**
 * =========================================================================
 * 2. ALGORITHMS SECTION (SEARCHING & SORTING)
 * =========================================================================
 */

function runMergeSort(arr, criteria) {
    if (arr.length <= 1) return arr;
    let mid = Math.floor(arr.length / 2);
    let leftSide = runMergeSort(arr.slice(0, mid), criteria);
    let rightSide = runMergeSort(arr.slice(mid), criteria);
    return mergeParts(leftSide, rightSide, criteria);
}

function mergeParts(left, right, criteria) {
    let result = [];
    let i = 0; let j = 0;
    while (i < left.length && j < right.length) {
        let valLeft = left[i][criteria];
        let valRight = right[j][criteria];
        if (typeof valLeft === 'string') {
            valLeft = valLeft.toLowerCase();
            valRight = valRight.toLowerCase();
        }
        if (valLeft < valRight) { result.push(left[i]); i++; }
        else { result.push(right[j]); j++; }
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}

function runBinarySearch(array, targetTitle) {
    let low = 0; let high = array.length - 1;
    let target = targetTitle.toLowerCase().trim();
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let middleValue = array[mid].title.toLowerCase().trim();
        if (middleValue === target) return array[mid];
        if (middleValue < target) low = mid + 1;
        else high = mid - 1;
    }
    return null;
}

/**
 * =========================================================================
 * 3. GLOBAL DATABASES & COUNTERS INITIALIZATION
 * =========================================================================
 */

let bookDatabase = createEmptyHashTable();
let memberDatabase = createEmptyHashTable();
let activityLogs = createLinkedList();

let nextBookId = 1000;
let nextMemberId = 2000;

window.onload = function() {
    loadSavedData();
    
    let currentLogs = convertLinkedListToArray(activityLogs);
    if (currentLogs.length === 0) {
        addNodeAtStart(activityLogs, "Project executed by Hibah, Gul e Maheen, Shiza, and Laveeza.");
    }
    
    refreshDisplay();
};

/**
 * =========================================================================
 * 4. SYSTEM ACTIONS FUNCTIONS
 * =========================================================================
 */

function addBook() {
    let title = document.getElementById('titleInput').value.trim();
    let author = document.getElementById('authorInput').value.trim();
    let genre = document.getElementById('genreInput').value;

    if (title === "" || author === "") {
        alert("Please enter all book details first.");
        return;
    }

    let idString = String(nextBookId);
    nextBookId++;

    let newBook = {
        id: idString,
        title: title,
        author: author,
        genre: genre,
        status: "Available",
        timestamp: Date.now(), 
        waitlist: createWaitlistQueue() 
    };

    insertIntoTable(bookDatabase, idString, newBook);
    addNodeAtStart(activityLogs, "Added Book ID: " + idString + " (" + title + ")");

    saveAllData();
    refreshDisplay();

    document.getElementById('titleInput').value = "";
    document.getElementById('authorInput').value = "";
}

function addMember() {
    let name = document.getElementById('memberNameInput').value.trim();
    let type = document.getElementById('memberTypeInput').value;

    if (name === "") {
        alert("Please enter member name first.");
        return;
    }

    let idString = String(nextMemberId);
    nextMemberId++;

    let newMember = { id: idString, name: name, type: type };

    insertIntoTable(memberDatabase, idString, newMember);
    addNodeAtStart(activityLogs, "Registered Member ID: " + idString + " (" + name + ")");

    saveAllData();
    refreshDisplay();

    document.getElementById('memberNameInput').value = "";
}

function issueBook() {
    let mId = document.getElementById('inputMemberId').value.trim();
    let bId = document.getElementById('inputBookId').value.trim();

    if (mId === "" || bId === "") {
        alert("Please enter both Member ID and Book ID.");
        return;
    }

    let targetMember = searchInTable(memberDatabase, mId);
    if (targetMember === null) {
        alert("Error: Member ID " + mId + " does not exist!");
        return;
    }

    let targetBook = searchInTable(bookDatabase, bId);
    if (targetBook === null) {
        alert("Error: Book ID " + bId + " does not exist!");
        return;
    }

    if (targetBook.status === "Available") {
        targetBook.status = "Borrowed";
        insertIntoTable(bookDatabase, bId, targetBook);
        addNodeAtStart(activityLogs, "Issued Book ID " + bId + " to Member " + mId);
    } else {
        enqueueMember(targetBook.waitlist, mId);
        insertIntoTable(bookDatabase, bId, targetBook);
        addNodeAtStart(activityLogs, "Book busy. Added Member " + mId + " to waitlist queue for Book ID " + bId);
    }

    saveAllData();
    refreshDisplay();
}

function returnBook() {
    let bId = document.getElementById('inputBookId').value.trim();
    if (bId === "") return;

    let targetBook = searchInTable(bookDatabase, bId);
    if (targetBook === null) {
        alert("Error: Book ID " + bId + " does not exist!");
        return;
    }

    activityLogs.addNodeAtStart("Returned Book ID " + bId);
    let nextPerson = dequeueMember(targetBook.waitlist);
    
    if (nextPerson !== null) {
        addNodeAtStart(activityLogs, "Waitlist updated. Book ID " + bId + " passed to next Member " + nextPerson);
    } else {
        targetBook.status = "Available";
    }

    insertIntoTable(bookDatabase, bId, targetBook);
    saveAllData();
    refreshDisplay();
}

function searchBook() {
    let allBooks = getTableValuesAsArray(bookDatabase);
    let query = document.getElementById('searchTitle').value.trim();
    if (query === "") { refreshDisplay(); return; }

    let sorted = runMergeSort(allBooks, "title"); 
    let result = runBinarySearch(sorted, query);
    let container = document.getElementById('bookListDisplay');
    if (!container) return;
    container.innerHTML = "";

    if (result !== null) {
        container.innerHTML = `
            <div class="item-row" style="background: rgba(16,185,129,0.05)">
                <div><strong>Match Found: ${result.title}</strong><br>
                <span>ID: ${result.id} | Author: ${result.author} | Genre: ${result.genre}</span></div>
                <span style="color: ${result.status === 'Available' ? 'var(--green)' : 'var(--red)'}">${result.status}</span>
            </div>`;
    } else {
        container.innerHTML = `<div style="color: var(--red); padding: 10px;">No matching book title found.</div>`;
    }
}

function sortBooks() {
    let allBooks = getTableValuesAsArray(bookDatabase);
    if (allBooks.length === 0) return;
    
    let chosenCriteria = document.getElementById('sortCriteria').value;
    let sorted = runMergeSort(allBooks, chosenCriteria);
    let container = document.getElementById('bookListDisplay');
    if (!container) return;
    container.innerHTML = "";

    let criteriaFriendlyName = "Name";
    if (chosenCriteria === "id") criteriaFriendlyName = "ID";
    if (chosenCriteria === "timestamp") criteriaFriendlyName = "Date of Creation";

    for (let i = 0; i < sorted.length; i++) {
        let b = sorted[i];
        let element = document.createElement('div');
        element.className = 'item-row';
        element.innerHTML = `
            <div><strong>${b.title}</strong><br><span>ID: ${b.id} | Author: ${b.author}</span></div>
            <span style="color: ${b.status === 'Available' ? 'var(--green)' : 'var(--red)'}">${b.status}</span>`;
        container.appendChild(element);
    }
    addNodeAtStart(activityLogs, "Sorted entire book collection by " + criteriaFriendlyName + " using Merge Sort.");
    saveAllData();
}

/**
 * =========================================================================
 * 5. RENDERING DYNAMIC DISPLAY GENERATORS
 * =========================================================================
 */

function refreshDisplay() {
    uiRenderBooks();
    uiRenderLogs();
    uiRenderQueues();
}

function uiRenderBooks() {
    let container = document.getElementById('bookListDisplay');
    if (!container) return; // If element isn't on current active page, exit
    container.innerHTML = "";
    let books = getTableValuesAsArray(bookDatabase);

    if (books.length === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No books added yet.</div>`;
        return;
    }
    for (let i = 0; i < books.length; i++) {
        let b = books[i];
        let element = document.createElement('div');
        element.className = 'item-row';
        element.innerHTML = `
            <div><strong>${b.title}</strong><br><span>ID: ${b.id} | Genre: ${b.genre}</span></div>
            <span style="color: ${b.status === 'Available' ? 'var(--green)' : 'var(--red)'}">${b.status}</span>`;
        container.appendChild(element);
    }
}

function uiRenderLogs() {
    let container = document.getElementById('logsDisplay');
    if (!container) return;
    container.innerHTML = "";
    let logs = convertLinkedListToArray(activityLogs);

    if (logs.length === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No logs recorded yet.</div>`;
        return;
    }
    for (let i = 0; i < logs.length; i++) {
        let l = logs[i];
        let element = document.createElement('div');
        element.className = 'item-row linked-list-node';
        element.innerHTML = `
            <div><strong>${l.text}</strong><br><span>Time: ${l.time}</span></div>
            <span class="dsa-badge" style="border-color: var(--purple); color: var(--purple)">${i === 0 ? 'HEAD' : 'NODE'}</span>`;
        container.appendChild(element);
    }
}

function uiRenderQueues() {
    let container = document.getElementById('queueListDisplay');
    if (!container) return;
    container.innerHTML = "";
    let books = getTableValuesAsArray(bookDatabase);
    let totalQueuesShowing = 0;

    for (let i = 0; i < books.length; i++) {
        let currentBook = books[i];
        let queueArray = convertQueueToArray(currentBook.waitlist);
        if (queueArray.length > 0) {
            totalQueuesShowing++;
            for (let j = 0; j < queueArray.length; j++) {
                let mId = queueArray[j];
                let memberObj = searchInTable(memberDatabase, mId);
                let nameStr = memberObj ? memberObj.name : "Unknown";

                let element = document.createElement('div');
                element.className = 'item-row queue-node';
                element.innerHTML = `
                    <div><strong>Book ID ${currentBook.id} Waiting Queue:</strong><br>
                    <span>Member: ID ${mId} (${nameStr})</span></div>
                    <span class="dsa-badge" style="border-color: var(--orange); color: var(--orange)">${j === 0 ? 'FRONT' : 'POS ' + (j + 1)}</span>`;
                container.appendChild(element);
            }
        }
    }
    if (totalQueuesShowing === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No active waiting list queues.</div>`;
    }
}

/**
 * =========================================================================
 * 6. LOCALSTORAGE PERSISTENCE & CSV EXPORT
 * =========================================================================
 */

function downloadCSV() {
    let data = convertLinkedListToArray(activityLogs);
    if (data.length === 0) return;
    let csvString = "data:text/csv;charset=utf-8,Time,Action Details\n";
    for (let i = 0; i < data.length; i++) {
        csvString += `"${data[i].time}","${data[i].text}"\n`;
    }
    let encoded = encodeURI(csvString);
    let link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", "Library_System_Logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveAllData() {
    let booksArr = getTableValuesAsArray(bookDatabase);
    let formattedBooks = [];
    for (let i = 0; i < booksArr.length; i++) {
        let b = booksArr[i];
        formattedBooks.push({
            id: b.id, title: b.title, author: b.author, genre: b.genre, status: b.status, timestamp: b.timestamp,
            flatQueue: convertQueueToArray(b.waitlist)
        });
    }
    let membersArr = getTableValuesAsArray(memberDatabase);
    let logsArr = convertLinkedListToArray(activityLogs);

    localStorage.setItem('student_books', JSON.stringify(formattedBooks));
    localStorage.setItem('student_members', JSON.stringify(membersArr));
    localStorage.setItem('student_logs', JSON.stringify(logsArr));
    localStorage.setItem('student_counters', JSON.stringify({ book: nextBookId, member: nextMemberId }));
}

function loadSavedData() {
    let savedBooks = localStorage.getItem('student_books');
    let savedMembers = localStorage.getItem('student_members');
    let savedLogs = localStorage.getItem('student_logs');
    let savedCounters = localStorage.getItem('student_counters');

    if (savedCounters) {
        let c = JSON.parse(savedCounters);
        nextBookId = c.book;
        nextMemberId = c.member;
    }
    if (savedMembers) {
        let m = JSON.parse(savedMembers);
        for (let i = 0; i < m.length; i++) {
            insertIntoTable(memberDatabase, m[i].id, m[i]);
        }
    }
    if (savedBooks) {
        let b = JSON.parse(savedBooks);
        for (let i = 0; i < b.length; i++) {
            let bookData = b[i];
            let newQueue = createWaitlistQueue();
            for (let j = 0; j < bookData.flatQueue.length; j++) {
                enqueueMember(newQueue, bookData.flatQueue[j]);
            }
            insertIntoTable(bookDatabase, bookData.id, {
                id: bookData.id, title: bookData.title, author: bookData.author, genre: bookData.genre, status: bookData.status,
                timestamp: bookData.timestamp || Date.now(),
                waitlist: newQueue
            });
        }
    }
    if (savedLogs) {
        let l = JSON.parse(savedLogs);
        for (let i = l.length - 1; i >= 0; i--) {
            addNodeAtStart(activityLogs, l[i].text, l[i].time);
        }
    }
}

function resetAllData() {
    if(confirm("Reset all data profiles?")) {
        localStorage.clear();
        location.reload();
    }
}

// Function to quickly fill the system with sample student project data
function populateRawData() {
    // 1. Add Sample Books (Auto-increments from 1000)
    let sampleBooks = [
        { title: "The Shining", author: "Stephen King", genre: "Horror" },
        { title: "Dracula", author: "Bram Stoker", genre: "Horror" },
        { title: "Gone Girl", author: "Gillian Flynn", genre: "Suspense" },
        { title: "The Silent Patient", author: "Alex Michaelides", genre: "Suspense" },
        { title: "The Bourne Identity", author: "Robert Ludlum", genre: "Action" },
        { title: "Die Trying", author: "Lee Child", genre: "Action" }
    ];

    for (let i = 0; i < sampleBooks.length; i++) {
        let idString = String(nextBookId);
        nextBookId++;
        
        let bookObj = {
            id: idString,
            title: sampleBooks[i].title,
            author: sampleBooks[i].author,
            genre: sampleBooks[i].genre,
            status: "Available",
            timestamp: Date.now() + (i * 1000), // spreads out timestamps slightly for date sorting testing
            waitlist: createWaitlistQueue()
        };
        insertIntoTable(bookDatabase, idString, bookObj);
        addNodeAtStart(activityLogs, "Raw Data Populate: Added Book ID " + idString + " (" + bookObj.title + ")");
    }

    // 2. Add Sample Members (Auto-increments from 2000)
    let sampleMembers = [
        { name: "Hibah Zehra", type: "Student" },
        { name: "Maheen", type: "Student" },
        { name: "Kumail", type: "Faculty" }
    ];

    for (let i = 0; i < sampleMembers.length; i++) {
        let idString = String(nextMemberId);
        nextMemberId++;

        let memberObj = {
            id: idString,
            name: sampleMembers[i].name,
            type: sampleMembers[i].type
        };
        insertIntoTable(memberDatabase, idString, memberObj);
        addNodeAtStart(activityLogs, "Raw Data Populate: Registered Member ID " + idString + " (" + memberObj.name + ")");
    }

    // 3. Create Sample Borrowing Transactions and Waitlist States manually for demonstration
    // Let's borrow Book 1000 (The Shining) for Member 2000
    let book1 = searchInTable(bookDatabase, "1000");
    if (book1) {
        book1.status = "Borrowed";
        insertIntoTable(bookDatabase, "1000", book1);
        addNodeAtStart(activityLogs, "Raw Data Populate: Issued Book ID 1000 to Member 2000");
        
        // Put Member 2001 into Book 1000's isolated hold list queue
        enqueueMember(book1.waitlist, "2001");
        addNodeAtStart(activityLogs, "Raw Data Populate: Added Member 2001 to waitlist queue for Book ID 1000");
    }

    // Let's borrow Book 1002 (Gone Girl) for Member 2001
    let book2 = searchInTable(bookDatabase, "1002");
    if (book2) {
        book2.status = "Borrowed";
        insertIntoTable(bookDatabase, "1002", book2);
        addNodeAtStart(activityLogs, "Raw Data Populate: Issued Book ID 1002 to Member 2001");
    }

    // Save everything down to localStorage and reload page views smoothly
    saveAllData();
    alert("System populated with sample book records, member registry data, and queue structures!");
    location.reload();
}