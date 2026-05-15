/**
 * =========================================================================
 * 1. CUSTOM DATA STRUCTURE ARCHITECTURES (DSA CORE IMPLEMENTATIONS)
 * =========================================================================
 */

// --- CUSTOM HASH TABLE (For O(1) Quick Lookups) ---
class HashTable {
    constructor(size = 50) {
        this.size = size;
        this.buckets = Array(size).fill(null).map(() => []);
    }

    _hash(key) {
        let hash = 0;
        const keyStr = String(key);
        for (let i = 0; i < keyStr.length; i++) {
            hash += keyStr.charCodeAt(i);
        }
        return hash % this.size;
    }

    set(key, value) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket[i][1] = value;
                return;
            }
        }
        bucket.push([key, value]);
    }

    get(key) {
        const index = this._hash(key);
        const bucket = this.buckets[index];
        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === String(key) || bucket[i][0] === Number(key)) {
                return bucket[i][1];
            }
        }
        return null;
    }

    getAllValues() {
        const list = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.buckets[i].length; j++) {
                list.push(this.buckets[i][j][1]);
            }
        }
        return list;
    }
}

// --- SINGLE LINKED LIST CORE (For Logs Tracking Chains) ---
class ListNode {
    constructor(actionText, timestamp) {
        this.actionText = actionText;
        this.timestamp = timestamp;
        this.next = null;
    }
}

class SinglyLinkedList {
    constructor() {
        this.head = null;
    }

    insertAtHead(actionText, timestamp = new Date().toLocaleTimeString()) {
        const newNode = new ListNode(actionText, timestamp);
        if (!this.head) {
            this.head = newNode;
        } else {
            newNode.next = this.head;
            this.head = newNode;
        }
    }

    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push({ log: current.actionText, time: current.timestamp });
            current = current.next;
        }
        return arr;
    }
}

// --- QUEUE IMPLEMENTATION (Isolated FIFO Logic Per Book) ---
class QueueNode {
    constructor(memberId) {
        this.memberId = memberId;
        this.next = null;
    }
}

class BookQueue {
    constructor() {
        this.front = null;
        this.rear = null;
    }

    enqueue(memberId) {
        const newNode = new QueueNode(memberId);
        if (!this.rear) {
            this.front = this.rear = newNode;
            return;
        }
        this.rear.next = newNode;
        this.rear = newNode;
    }

    dequeue() {
        if (!this.front) return null;
        const temp = this.front;
        this.front = this.front.next;
        if (!this.front) this.rear = null;
        return temp.memberId;
    }

    toArray() {
        const list = [];
        let current = this.front;
        while (current) {
            list.push(current.memberId);
            current = current.next;
        }
        return list;
    }
}

/**
 * =========================================================================
 * 2. ALGORITHMIC ENGINES IMPLEMENTATION (SEARCHING & SORTING)
 * =========================================================================
 */

function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    let result = [], lIdx = 0, rIdx = 0;
    while (lIdx < left.length && rIdx < right.length) {
        if (left[lIdx].title.toLowerCase() < right[rIdx].title.toLowerCase()) {
            result.push(left[lIdx++]);
        } else {
            result.push(right[rIdx++]);
        }
    }
    return result.concat(left.slice(lIdx)).concat(right.slice(rIdx));
}

function binarySearchByTitle(sortedArray, targetTitle) {
    let low = 0;
    let high = sortedArray.length - 1;
    const cleanTarget = targetTitle.toLowerCase().trim();

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midVal = sortedArray[mid].title.toLowerCase().trim();

        if (midVal === cleanTarget) return sortedArray[mid];
        if (midVal < cleanTarget) low = mid + 1;
        else high = mid - 1;
    }
    return null;
}

/**
 * =========================================================================
 * 3. RUNTIME GLOBAL DATABASES & AUTO-INCREMENT ARCHITECTURE
 * =========================================================================
 */

const BookCatalog = new HashTable();   // Mapped storage for Books
const MemberRegistry = new HashTable(); // Mapped storage for Members
const AuditTrail = new SinglyLinkedList();

// Auto-increment track registers starting counters
let currentIsbnCounter = 1000;
let currentMemberIdCounter = 2000;

window.onload = function() {
    loadMemoryFromLocalStorage();
    uiRenderAllContainers();
};

/**
 * =========================================================================
 * 4. UI HANDLERS & IMPLEMENTED VALIDATION CHECK RUNTIMES
 * =========================================================================
 */

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(tabId + '-tab').classList.add('active');
    event.currentTarget.classList.add('active');
}

// Requirement 3: Add Book with Auto-Assign ISBN (Starting from 1000)
function uiAddBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const genre = document.getElementById('bookGenre').value;

    if (!title || !author) {
        alert("Action rejected. Book title and author inputs are mandatory.");
        return;
    }

    const assignedIsbn = String(currentIsbnCounter++);
    
    // Requirement 4: Every book record gets its own dedicated Queue instance assigned internally
    const bookObj = { 
        isbn: assignedIsbn, 
        title, 
        author, 
        genre, 
        status: 'Available',
        reservationQueue: new BookQueue() 
    };

    BookCatalog.set(assignedIsbn, bookObj);
    AuditTrail.insertAtHead(`Registered Book. Auto-Assigned ISBN: ${assignedIsbn} (${title})`);

    saveMemoryToLocalStorage();
    uiRenderAllContainers();

    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
}

// Requirement 1 & 3: Create Member with Auto-Assign ID (Starting from 2000)
function uiAddMember() {
    const name = document.getElementById('memberName').value.trim();
    const type = document.getElementById('memberType').value;

    if (!name) {
        alert("Action rejected. Member name field is mandatory.");
        return;
    }

    const assignedMemberId = String(currentMemberIdCounter++);
    const memberObj = { id: assignedMemberId, name, type };

    MemberRegistry.set(assignedMemberId, memberObj);
    AuditTrail.insertAtHead(`Registered Member. Auto-Assigned ID: ${assignedMemberId} (${name})`);

    saveMemoryToLocalStorage();
    uiRenderAllContainers();

    document.getElementById('memberName').value = '';
}

// Requirement 2: Validate if Member ID and Book ISBN exist while issuing/borrowing
function uiIssueBook() {
    const memberId = document.getElementById('memberID').value.trim();
    const isbn = document.getElementById('checkoutISBN').value.trim();

    if (!memberId || !isbn) {
        alert("Please enter both Member ID and Book ISBN.");
        return;
    }

    // Validation Check Step 1: Does member exist?
    const memberExists = MemberRegistry.get(memberId);
    if (!memberExists) {
        alert(`Validation Error: Member ID "${memberId}" does not exist in the registry system.`);
        return;
    }

    // Validation Check Step 2: Does book exist?
    const bookObj = BookCatalog.get(isbn);
    if (!bookObj) {
        alert(`Validation Error: Book ISBN "${isbn}" does not exist inside the catalog system.`);
        return;
    }

    // Processing Allocation
    if (bookObj.status === 'Available') {
        bookObj.status = 'Borrowed';
        BookCatalog.set(isbn, bookObj);
        AuditTrail.insertAtHead(`Success: Issued ISBN ${isbn} to Member ${memberId} (${memberExists.name})`);
    } else {
        // Requirement 4: Enqueue borrower inside that specific book's isolated storage list queue
        bookObj.reservationQueue.enqueue(memberId);
        BookCatalog.set(isbn, bookObj);
        AuditTrail.insertAtHead(`Hold Placed: ISBN ${isbn} is busy. Member ${memberId} added to its isolated queue.`);
    }

    saveMemoryToLocalStorage();
    uiRenderAllContainers();
}

function uiReturnBook() {
    const isbn = document.getElementById('checkoutISBN').value.trim();
    if (!isbn) return;

    const bookObj = BookCatalog.get(isbn);
    if (!bookObj) {
        alert(`Validation Error: Target return ISBN "${isbn}" does not exist.`);
        return;
    }

    // Requirement 4: Pop next reservation directly out of the book's individual queue instance
    const nextMemberInQueue = bookObj.reservationQueue.dequeue();
    
    if (nextMemberInQueue) {
        const nextMemberObj = MemberRegistry.get(nextMemberInQueue);
        AuditTrail.insertAtHead(`Queue Hold Resolved: ISBN ${isbn} auto-assigned to waiting member ${nextMemberInQueue} (${nextMemberObj.name})`);
    } else {
        bookObj.status = 'Available';
        AuditTrail.insertAtHead(`Success: Returned ISBN ${isbn}. Status marked back to Available.`);
    }

    BookCatalog.set(isbn, bookObj);
    saveMemoryToLocalStorage();
    uiRenderAllContainers();
}

/**
 * =========================================================================
 * 5. SEARCH, SORT, AND DATA RENDERING ENGINE GENERATORS
 * =========================================================================
 */

function uiTriggerSearch() {
    const rawList = BookCatalog.getAllValues();
    const query = document.getElementById('catalogSearchInput').value.trim();
    if (!query) { uiRenderAllContainers(); return; }

    const sortedList = mergeSort(rawList);
    const matchedBook = binarySearchByTitle(sortedList, query);
    const container = document.getElementById('inventoryDisplay');
    container.innerHTML = '';

    if (matchedBook) {
        container.innerHTML = `
            <div class="data-item" style="border-left-color: var(--green-emerald); background: rgba(16,185,129,0.05)">
                <div><strong>🎯 MATCH FOUND: ${matchedBook.title}</strong><br>
                <span>ISBN: ${matchedBook.isbn} | Author: ${matchedBook.author} | Genre: ${matchedBook.genre}</span></div>
                <span style="color: ${matchedBook.status === 'Available' ? 'var(--green-emerald)' : 'var(--red-alert)'}">${matchedBook.status}</span>
            </div>`;
    } else {
        container.innerHTML = `<div style="color: var(--red-alert); padding: 10px;">No matching catalog items found.</div>`;
    }
}

function uiTriggerSort() {
    const rawList = BookCatalog.getAllValues();
    if (rawList.length === 0) return;
    const sortedList = mergeSort(rawList);
    const container = document.getElementById('inventoryDisplay');
    container.innerHTML = '';

    sortedList.forEach(book => {
        const item = document.createElement('div');
        item.className = 'data-item';
        item.innerHTML = `
            <div><strong>${book.title}</strong><br><span class="metadata">ISBN: ${book.isbn} | Author: ${book.author}</span></div>
            <span style="color: ${book.status === 'Available' ? 'var(--green-emerald)' : 'var(--red-alert)'}">${book.status}</span>`;
        container.appendChild(item);
    });
    AuditTrail.insertAtHead("Executed runtime catalog organization using Merge Sort logic.");
    uiRenderHistoryContainer();
}

function uiRenderAllContainers() {
    uiRenderInventoryContainer();
    uiRenderHistoryContainer();
    uiRenderQueueContainer();
}

function uiRenderInventoryContainer() {
    const container = document.getElementById('inventoryDisplay');
    container.innerHTML = '';
    const items = BookCatalog.getAllValues();

    if(items.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); padding: 10px;">No books registered in system memory registers.</div>`;
        return;
    }

    items.forEach(book => {
        const el = document.createElement('div');
        el.className = 'data-item';
        el.innerHTML = `
            <div><strong>${book.title}</strong><br><span class="metadata">ISBN: ${book.isbn} | Author: ${book.author} | Genre: ${book.genre}</span></div>
            <span style="color: ${book.status === 'Available' ? 'var(--green-emerald)' : 'var(--red-alert)'}">${book.status}</span>`;
        container.appendChild(el);
    });
}

function uiRenderHistoryContainer() {
    const container = document.getElementById('historyDisplay');
    container.innerHTML = '';
    const logs = AuditTrail.toArray();

    if(logs.length === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); padding: 10px;">Audit trail unallocated.</div>`;
        return;
    }

    logs.forEach((logItem, idx) => {
        const el = document.createElement('div');
        el.className = 'data-item linked-list-node';
        el.innerHTML = `
            <div><strong>${logItem.log}</strong><br><span class="metadata">Timestamp: ${logItem.time}</span></div>
            <span class="dsa-badge" style="border-color: var(--purple-node); color: var(--purple-node)">${idx === 0 ? 'HEAD PTR' : 'NODE'}</span>`;
        container.appendChild(el);
    });
}

// Requirement 4: Renders isolated hold queue listings for all items currently showing waiting entries
function uiRenderQueueContainer() {
    const container = document.getElementById('queueDisplay');
    container.innerHTML = '';
    const allBooks = BookCatalog.getAllValues();
    let holdCount = 0;

    allBooks.forEach(book => {
        const queueArr = book.reservationQueue.toArray();
        if (queueArr.length > 0) {
            holdCount++;
            queueArr.forEach((waitingMemberId, index) => {
                const memberObj = MemberRegistry.get(waitingMemberId);
                const el = document.createElement('div');
                el.className = 'data-item queue-node';
                el.innerHTML = `
                    <div><strong>Book ISBN ${book.isbn} holds list:</strong><br>
                    <span class="metadata">Waiting Member: ID ${waitingMemberId} (${memberObj ? memberObj.name : 'Unknown'})</span></div>
                    <span class="dsa-badge" style="border-color: var(--orange-queue); color: var(--orange-queue)">${index === 0 ? 'FRONT' : 'POS ' + (index + 1)}</span>`;
                container.appendChild(el);
            });
        }
    });

    if (holdCount === 0) {
        container.innerHTML = `<div style="color: var(--text-muted); padding: 10px;">No isolated hold queues currently active in the system pipeline buffers.</div>`;
    }
}

/**
 * =========================================================================
 * 6. BACKEND STORAGE UTILITIES & JSON STRINGIFICATION COMPATIBILITY
 * =========================================================================
 */

function exportHistoryToCSV() {
    const data = AuditTrail.toArray();
    if (data.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,Timestamp,Transaction Details\n";
    data.forEach(item => { csvContent += `"${item.time}","${item.log.replace(/"/g, '""')}"\n`; });
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", "Library_DSA_Audit_Trail.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
}

function saveMemoryToLocalStorage() {
    const books = BookCatalog.getAllValues();
    // Serialization mapper format backup copies isolated instance parameters arrays data models structures 
    const packagedBooks = books.map(b => ({
        isbn: b.isbn, title: b.title, author: b.author, genre: b.genre, status: b.status,
        queueData: b.reservationQueue.toArray()
    }));
    
    const members = MemberRegistry.getAllValues();
    const history = AuditTrail.toArray();

    localStorage.setItem('lms_books_v2', JSON.stringify(packagedBooks));
    localStorage.setItem('lms_members_v2', JSON.stringify(members));
    localStorage.setItem('lms_history_v2', JSON.stringify(history));
    localStorage.setItem('lms_counters_v2', JSON.stringify({ isbn: currentIsbnCounter, member: currentMemberIdCounter }));
}

function loadMemoryFromLocalStorage() {
    const cachedBooks = localStorage.getItem('lms_books_v2');
    const cachedMembers = localStorage.getItem('lms_members_v2');
    const cachedHistory = localStorage.getItem('lms_history_v2');
    const cachedCounters = localStorage.getItem('lms_counters_v2');

    if (cachedCounters) {
        const counters = JSON.parse(cachedCounters);
        currentIsbnCounter = counters.isbn;
        currentMemberIdCounter = counters.member;
    }
    if (cachedMembers) {
        JSON.parse(cachedMembers).forEach(m => MemberRegistry.set(m.id, m));
    }
    if (cachedBooks) {
        JSON.parse(cachedBooks).forEach(b => {
            const qInstance = new BookQueue();
            b.queueData.forEach(mId => qInstance.enqueue(mId));
            BookCatalog.set(b.isbn, {
                isbn: b.isbn, title: b.title, author: b.author, genre: b.genre, status: b.status,
                reservationQueue: qInstance
            });
        });
    }
    if (cachedHistory) {
        const parsed = JSON.parse(cachedHistory);
        for (let i = parsed.length - 1; i >= 0; i--) {
            AuditTrail.insertAtHead(parsed[i].log, parsed[i].time);
        }
    }
}

function clearSystemStorage() {
    if(confirm("Are you sure you want to completely clear all system datasets and configuration values?")) {
        localStorage.clear();
        location.reload();
    }
}