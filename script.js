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

function enqueueMember(queueObject, memberId, timestamp = Date.now()) {
    let newNode = { memberId: memberId, timestamp: timestamp, next: null };
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

function convertQueueToArray(queueObject, returnObjects = false) {
    let list = [];
    let current = queueObject.front;
    while (current !== null) {
        list.push(returnObjects ? { memberId: current.memberId, timestamp: current.timestamp } : current.memberId);
        current = current.next;
    }
    return list;
}

function pruneWaitlist(targetBook) {
    if (!targetBook.waitlist) return;
    let now = Date.now();
    let oneMonthMs = 30 * 24 * 60 * 60 * 1000;
    
    let current = targetBook.waitlist.front;
    let newQueue = createWaitlistQueue();
    while (current !== null) {
        if ((now - current.timestamp) <= oneMonthMs) {
            enqueueMember(newQueue, current.memberId, current.timestamp);
        }
        current = current.next;
    }
    targetBook.waitlist = newQueue;
}



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

function runMemberBinarySearch(array, targetName) {
    let low = 0; let high = array.length - 1;
    let target = targetName.toLowerCase().trim();
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let middleValue = array[mid].name.toLowerCase().trim();
        if (middleValue === target) return array[mid];
        if (middleValue < target) low = mid + 1;
        else high = mid - 1;
    }
    return null;
}


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


function addBook() {
    let title = document.getElementById('titleInput').value.trim();
    let author = document.getElementById('authorInput').value.trim();
    let genre = document.getElementById('genreInput').value;

    if (title === "" || author === "") {
        Swal.fire({ title: 'Error!', text: 'Please enter all book details first.', icon: 'error' });
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
    Swal.fire({ title: 'Success!', text: 'Book added with ID ' + idString + '!', icon: 'success' });

    saveAllData();
    refreshDisplay();

    document.getElementById('titleInput').value = "";
    document.getElementById('authorInput').value = "";
}

function addMember() {
    let name = document.getElementById('memberNameInput').value.trim();
    let type = document.getElementById('memberTypeInput').value;

    if (name === "") {
        Swal.fire({ title: 'Error!', text: 'Please enter member name first.', icon: 'error' });
        return;
    }

    let idString = String(nextMemberId);
    nextMemberId++;

    let newMember = { id: idString, name: name, type: type };

    insertIntoTable(memberDatabase, idString, newMember);
    addNodeAtStart(activityLogs, "Registered Member ID: " + idString + " (" + name + ")");
    Swal.fire({ title: 'Success!', text: 'Member registered with ID ' + idString + '!', icon: 'success' });

    saveAllData();
    refreshDisplay();

    document.getElementById('memberNameInput').value = "";
}

function issueBook() {
    let mId = document.getElementById('inputMemberId').value.trim();
    let bId = document.getElementById('inputBookId').value.trim();

    if (mId === "" || bId === "") {
        Swal.fire({ title: 'Error!', text: 'Please enter both Member ID and Book ID.', icon: 'error' });
        return;
    }

    let targetMember = searchInTable(memberDatabase, mId);
    if (targetMember === null) {
        Swal.fire({ title: 'Error!', text: 'Member ID ' + mId + ' does not exist!', icon: 'error' });
        return;
    }

    let targetBook = searchInTable(bookDatabase, bId);
    if (targetBook === null) {
        Swal.fire({ title: 'Error!', text: 'Book ID ' + bId + ' does not exist!', icon: 'error' });
        return;
    }

    pruneWaitlist(targetBook);
    let nextPerson = targetBook.waitlist.front ? targetBook.waitlist.front.memberId : null;

    if (targetBook.status === "Available") {
        if (nextPerson && nextPerson !== mId) {
            let waitlistArray = convertQueueToArray(targetBook.waitlist);
            if (waitlistArray.includes(mId)) {
                Swal.fire({ title: 'Error!', text: 'Member ' + mId + ' is already in the waitlist for Book ID ' + bId + '.', icon: 'error' });
                return;
            }
            
            let allBooks = getTableValuesAsArray(bookDatabase);
            let sameGenreBooks = allBooks.filter(b => b.genre === targetBook.genre && b.status === "Available" && b.id !== targetBook.id && !b.waitlist.front);
            
            let additionalText = "";
            if (sameGenreBooks.length > 0) {
                let names = sameGenreBooks.map(b => b.title + " (ID: " + b.id + ")").join("<br>• ");
                additionalText = "<br><br><b>Other available books in " + targetBook.genre + ":</b><br>• " + names;
            } else {
                additionalText = "<br><br><i>No other available books in " + targetBook.genre + " right now.</i>";
            }

            Swal.fire({ 
                title: 'Reserved', 
                html: 'This book is currently reserved for member ' + nextPerson + '.' + additionalText + '<br><br><b>Do you want to be added to the waitlist?</b>', 
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Yes, add me!',
                cancelButtonText: 'No, cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    enqueueMember(targetBook.waitlist, mId);
                    insertIntoTable(bookDatabase, bId, targetBook);
                    addNodeAtStart(activityLogs, "Book reserved. Added Member " + mId + " to waitlist queue for Book ID " + bId);
                    saveAllData();
                    refreshDisplay();
                    Swal.fire('Success', 'Added to waitlist!', 'success');
                }
            });
            return;
        }

        if (nextPerson === mId) {
            dequeueMember(targetBook.waitlist);
        }

        targetBook.status = "Borrowed";
        targetBook.borrowedTimestamp = Date.now();
        targetBook.borrowerId = mId;
        insertIntoTable(bookDatabase, bId, targetBook);
        addNodeAtStart(activityLogs, "Issued Book ID " + bId + " to Member " + mId);
        Swal.fire({ title: 'Success!', text: 'Book ID ' + bId + ' issued to Member ' + mId + '.', icon: 'success' });
        
        saveAllData();
        refreshDisplay();
    } else {
        if (targetBook.borrowerId === mId) {
            Swal.fire({ title: 'Error!', text: 'Member ' + mId + ' has already borrowed this book!', icon: 'error' });
            return;
        }

        let waitlistArray = convertQueueToArray(targetBook.waitlist);
        if (waitlistArray.includes(mId)) {
            Swal.fire({ title: 'Error!', text: 'Member ' + mId + ' is already in the waitlist for Book ID ' + bId + '.', icon: 'error' });
            return;
        }
        
        let allBooks = getTableValuesAsArray(bookDatabase);
        let sameGenreBooks = allBooks.filter(b => b.genre === targetBook.genre && b.status === "Available" && b.id !== targetBook.id);
        
        let additionalText = "";
        if (sameGenreBooks.length > 0) {
            let names = sameGenreBooks.map(b => b.title + " (ID: " + b.id + ")").join("<br>• ");
            additionalText = "<br><br><b>Other available books in " + targetBook.genre + ":</b><br>• " + names;
        } else {
            additionalText = "<br><br><i>No other available books in " + targetBook.genre + " right now.</i>";
        }

        Swal.fire({ 
            title: 'Waitlist', 
            html: 'Book is currently borrowed.' + additionalText + '<br><br><b>Do you want to be added to the waitlist?</b>', 
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Yes, add me!',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                enqueueMember(targetBook.waitlist, mId);
                insertIntoTable(bookDatabase, bId, targetBook);
                addNodeAtStart(activityLogs, "Book busy. Added Member " + mId + " to waitlist queue for Book ID " + bId);
                saveAllData();
                refreshDisplay();
                Swal.fire('Success', 'Added to waitlist!', 'success');
            }
        });
    }
}

function returnBook() {
    let mId = document.getElementById('inputMemberId').value.trim();
    let bId = document.getElementById('inputBookId').value.trim();
    
    if (mId === "" || bId === "") {
        Swal.fire({ title: 'Error!', text: 'Please enter both Member ID and Book ID to return.', icon: 'error' });
        return;
    }

    let targetMember = searchInTable(memberDatabase, mId);
    if (targetMember === null) {
        Swal.fire({ title: 'Error!', text: 'Member ID ' + mId + ' does not exist!', icon: 'error' });
        return;
    }

    let targetBook = searchInTable(bookDatabase, bId);
    if (targetBook === null) {
        Swal.fire({ title: 'Error!', text: 'Book ID ' + bId + ' does not exist!', icon: 'error' });
        return;
    }

    if (targetBook.status !== "Borrowed") {
        Swal.fire({ title: 'Error!', text: 'Book ID ' + bId + ' is not currently borrowed!', icon: 'error' });
        return;
    }

    if (targetBook.borrowerId !== mId) {
        Swal.fire({ title: 'Error!', text: 'Book ID ' + bId + ' was borrowed by a different member. Member ID ' + mId + ' cannot return it.', icon: 'error' });
        return;
    }

    let fineHtml = "";
    let isLate = false;
    if (targetBook.status === "Borrowed" && targetBook.borrowedTimestamp) {
        let diffMs = Date.now() - targetBook.borrowedTimestamp;
        let diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 7) {
            isLate = true;
            fineHtml = "<br><br><b style='color: var(--red);'>Late Return: Book returned after 1 week. Fine: Rs.200</b>";
        }
    }

    addNodeAtStart(activityLogs, "Returned Book ID " + bId + " by Member " + mId);
    
    pruneWaitlist(targetBook);
    let nextPerson = targetBook.waitlist.front ? targetBook.waitlist.front.memberId : null;
    
    targetBook.status = "Available";
    targetBook.borrowedTimestamp = null;
    targetBook.borrowerId = null;

    let successMsg = nextPerson !== null 
        ? 'Book ID ' + bId + ' returned successfully. It is now reserved for waitlisted Member ' + nextPerson + '.'
        : 'Book ID ' + bId + ' returned successfully. It is now available.';

    Swal.fire({ 
        title: isLate ? 'Returned (With Fine)' : 'Success!', 
        html: successMsg + fineHtml, 
        icon: isLate ? 'warning' : 'success' 
    });

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
    
    let statusFilter = document.getElementById('filterBookStatus');
    let filterValue = statusFilter ? statusFilter.value : "All";

    let container = document.getElementById('bookListDisplay');
    if (!container) return;
    container.innerHTML = "";

    let criteriaFriendlyName = "Name";
    if (chosenCriteria === "id") criteriaFriendlyName = "ID";
    if (chosenCriteria === "timestamp") criteriaFriendlyName = "Date of Creation";

    let filteredCount = 0;
    for (let i = 0; i < sorted.length; i++) {
        let b = sorted[i];
        if (filterValue === "All" || b.status === filterValue) {
            let element = document.createElement('div');
            element.className = 'item-row';
            element.innerHTML = `
                <div><strong>${b.title}</strong><br><span>ID: ${b.id} | Author: ${b.author}</span></div>
                <span style="color: ${b.status === 'Available' ? 'var(--green)' : 'var(--red)'}">${b.status}</span>`;
            container.appendChild(element);
            filteredCount++;
        }
    }
    
    if (filteredCount === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No books to display.</div>`;
    }
    addNodeAtStart(activityLogs, "Sorted entire book collection by " + criteriaFriendlyName + " using Merge Sort.");
    saveAllData();
}

function filterBooks() {
    refreshDisplay();
}


function refreshDisplay() {
    uiRenderBooks();
    uiRenderMembers();
    uiRenderLogs();
    uiRenderQueues();
    if (typeof uiRenderBorrowedBooks === "function") uiRenderBorrowedBooks();
}

function uiRenderBooks() {
    let container = document.getElementById('bookListDisplay');
    if (!container) return; // If element isn't on current active page, exit
    container.innerHTML = "";
    let books = getTableValuesAsArray(bookDatabase);

    let statusFilter = document.getElementById('filterBookStatus');
    let filterValue = statusFilter ? statusFilter.value : "All";

    let filteredBooks = [];
    for (let i = 0; i < books.length; i++) {
        if (filterValue === "All" || books[i].status === filterValue) {
            filteredBooks.push(books[i]);
        }
    }

    if (filteredBooks.length === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No books to display.</div>`;
        return;
    }
    for (let i = 0; i < filteredBooks.length; i++) {
        let b = filteredBooks[i];
        let element = document.createElement('div');
        element.className = 'item-row';
        element.innerHTML = `
            <div><strong>${b.title}</strong><br><span>ID: ${b.id} | Genre: ${b.genre}</span></div>
            <span style="color: ${b.status === 'Available' ? 'var(--green)' : 'var(--red)'}">${b.status}</span>`;
        container.appendChild(element);
    }
}

function uiRenderMembers() {
    let container = document.getElementById('memberListDisplay');
    if (!container) return;
    container.innerHTML = "";
    let members = getTableValuesAsArray(memberDatabase);
    
    let typeFilter = document.getElementById('filterMemberType');
    let filterValue = typeFilter ? typeFilter.value : "All";

    let filteredMembers = [];
    for (let i = 0; i < members.length; i++) {
        if (filterValue === "All" || members[i].type === filterValue) {
            filteredMembers.push(members[i]);
        }
    }

    if (filteredMembers.length === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No members to display.</div>`;
        return;
    }
    for (let i = 0; i < filteredMembers.length; i++) {
        let m = filteredMembers[i];
        let element = document.createElement('div');
        element.className = 'item-row';
        element.innerHTML = `
            <div><strong>${m.name}</strong><br><span>ID: ${m.id} | Type: ${m.type}</span></div>
            <span style="color: var(--purple)">Active</span>`;
        container.appendChild(element);
    }
}

function searchMember() {
    let allMembers = getTableValuesAsArray(memberDatabase);
    let query = document.getElementById('searchMemberName').value.trim();
    if (query === "") { refreshDisplay(); return; }

    let sorted = runMergeSort(allMembers, "name"); 
    let result = runMemberBinarySearch(sorted, query);
    let container = document.getElementById('memberListDisplay');
    if (!container) return;
    container.innerHTML = "";

    if (result !== null) {
        container.innerHTML = `
            <div class="item-row" style="background: rgba(16,185,129,0.05)">
                <div><strong>Match Found: ${result.name}</strong><br>
                <span>ID: ${result.id} | Type: ${result.type}</span></div>
                <span style="color: var(--purple)">Active</span>
            </div>`;
    } else {
        container.innerHTML = `<div style="color: var(--red); padding: 10px;">No matching member name found.</div>`;
    }
}

function sortMembers() {
    let allMembers = getTableValuesAsArray(memberDatabase);
    if (allMembers.length === 0) return;
    
    let chosenCriteria = document.getElementById('sortMemberCriteria').value;
    let sorted = runMergeSort(allMembers, chosenCriteria);
    
    let typeFilter = document.getElementById('filterMemberType');
    let filterValue = typeFilter ? typeFilter.value : "All";
    
    let container = document.getElementById('memberListDisplay');
    if (!container) return;
    container.innerHTML = "";

    let filteredCount = 0;
    for (let i = 0; i < sorted.length; i++) {
        let m = sorted[i];
        if (filterValue === "All" || m.type === filterValue) {
            let element = document.createElement('div');
            element.className = 'item-row';
            element.innerHTML = `
                <div><strong>${m.name}</strong><br><span>ID: ${m.id} | Type: ${m.type}</span></div>
                <span style="color: var(--purple)">Active</span>`;
            container.appendChild(element);
            filteredCount++;
        }
    }
    
    if (filteredCount === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No members to display.</div>`;
    }

    let criteriaFriendlyName = chosenCriteria === "id" ? "ID" : "Name";
    addNodeAtStart(activityLogs, "Sorted entire member collection by " + criteriaFriendlyName + " using Merge Sort.");
    saveAllData();
}

function filterMembers() {
    refreshDisplay();
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
            borrowedTimestamp: b.borrowedTimestamp,
            borrowerId: b.borrowerId,
            flatQueue: convertQueueToArray(b.waitlist, true)
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
                let item = bookData.flatQueue[j];
                if (typeof item === 'object') {
                    enqueueMember(newQueue, item.memberId, item.timestamp);
                } else {
                    enqueueMember(newQueue, item, Date.now());
                }
            }
            insertIntoTable(bookDatabase, bookData.id, {
                id: bookData.id, title: bookData.title, author: bookData.author, genre: bookData.genre, status: bookData.status,
                timestamp: bookData.timestamp || Date.now(),
                borrowedTimestamp: bookData.borrowedTimestamp,
                borrowerId: bookData.borrowerId,
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
    Swal.fire({
        title: 'Are you sure?',
        text: "Reset all data profiles? This action cannot be undone.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, reset it!'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            location.reload();
        }
    });
}

function uiRenderBorrowedBooks(bookList = null) {
    let container = document.getElementById('borrowedBooksDisplay');
    if (!container) return;
    container.innerHTML = "";

    let books = bookList !== null ? bookList : getTableValuesAsArray(bookDatabase);
    let borrowedBooks = books.filter(b => b.status === "Borrowed");

    if (borrowedBooks.length === 0) {
        container.innerHTML = `<div style="color: var(--text-grey); padding: 10px;">No books currently borrowed.</div>`;
        return;
    }

    for (let i = 0; i < borrowedBooks.length; i++) {
        let b = borrowedBooks[i];
        let mId = b.borrowerId;
        let memberObj = mId ? searchInTable(memberDatabase, mId) : null;
        let memberName = memberObj ? memberObj.name : "Unknown Member";
        
        let dateStr = b.borrowedTimestamp ? new Date(b.borrowedTimestamp).toLocaleString() : "Unknown Date";
        let dueStr = b.borrowedTimestamp ? new Date(b.borrowedTimestamp + 7 * 24 * 60 * 60 * 1000).toLocaleString() : "Unknown Date";

        let element = document.createElement('div');
        element.className = 'item-row';
        element.innerHTML = `
            <div>
                <strong>${b.title} (ID: ${b.id})</strong><br>
                <span>Borrowed by: ${memberName} (ID: ${mId})</span>
            </div>
            <div style="text-align: right;">
                <span style="color: var(--orange); font-size: 0.9em; display: block;">Issue Date: ${dateStr}</span>
                <span style="color: var(--red); font-size: 0.9em; display: block;">Due Date: ${dueStr}</span>
            </div>`;
        container.appendChild(element);
    }
}

function searchBorrowedBooks() {
    let query = document.getElementById('searchBorrowed').value.toLowerCase().trim();
    if (query === "") { 
        uiRenderBorrowedBooks(); 
        return; 
    }

    let allBooks = getTableValuesAsArray(bookDatabase);
    let borrowedBooks = allBooks.filter(b => b.status === "Borrowed");
    
    let results = [];
    for (let i = 0; i < borrowedBooks.length; i++) {
        let b = borrowedBooks[i];
        let mId = b.borrowerId;
        let memberObj = mId ? searchInTable(memberDatabase, mId) : null;
        let memberName = memberObj ? memberObj.name.toLowerCase() : "";
        let bookTitle = b.title.toLowerCase();
        let bookIdStr = String(b.id);
        let mIdStr = String(mId);

        if (bookTitle.includes(query) || memberName.includes(query) || bookIdStr === query || mIdStr === query) {
            results.push(b);
        }
    }
    
    uiRenderBorrowedBooks(results);
}

function sortBorrowedBooks() {
    let allBooks = getTableValuesAsArray(bookDatabase);
    let borrowedBooks = allBooks.filter(b => b.status === "Borrowed");
    
    let sorted = runMergeSort(borrowedBooks, "borrowedTimestamp");
    // MergeSort here sorts ascending (oldest first).
    // Let's reverse it to show latest first.
    sorted.reverse();
    
    uiRenderBorrowedBooks(sorted);
    addNodeAtStart(activityLogs, "Sorted borrowed books by date using Merge Sort.");
    saveAllData();
}

function resetBorrowedSearch() {
    let searchInput = document.getElementById('searchBorrowed');
    if (searchInput) searchInput.value = "";
    uiRenderBorrowedBooks();
}







// ********OPtional Section*************




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
            timestamp: Date.now() + (i * 1000), 
            waitlist: createWaitlistQueue()
        };
        insertIntoTable(bookDatabase, idString, bookObj);
        addNodeAtStart(activityLogs, "Raw Data Populate: Added Book ID " + idString + " (" + bookObj.title + ")");
    }

    let sampleMembers = [
        { name: "Hibah Zehra", type: "Student" },
        { name: "Gul e Maheen", type: "Student" },
        { name: "Shiza Jamal", type: "Student" },
        { name: "Laveeza Khan Niazi", type: "Student" }
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

    let book1 = searchInTable(bookDatabase, "1000");
    if (book1) {
        book1.status = "Borrowed";
        book1.borrowerId = "2000";
        book1.borrowedTimestamp = Date.now() - 14 * 24 * 60 * 60 * 1000;
        insertIntoTable(bookDatabase, "1000", book1);
        addNodeAtStart(activityLogs, "Raw Data Populate: Issued Book ID 1000 to Member 2000");
        enqueueMember(book1.waitlist, "2001");
        addNodeAtStart(activityLogs, "Raw Data Populate: Added Member 2001 to waitlist queue for Book ID 1000");
    }

    let book2 = searchInTable(bookDatabase, "1002");
    if (book2) {
        book2.status = "Borrowed";
        book2.borrowerId = "2001";
        book2.borrowedTimestamp = Date.now();
        insertIntoTable(bookDatabase, "1002", book2);
        addNodeAtStart(activityLogs, "Raw Data Populate: Issued Book ID 1002 to Member 2001");
    }

    saveAllData();
    Swal.fire({ title: 'Success!', text: 'System populated!', icon: 'success' }).then(() => { location.reload(); });
}