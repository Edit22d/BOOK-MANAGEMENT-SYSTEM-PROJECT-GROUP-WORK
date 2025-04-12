// References to elements
const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const favoriteList = document.getElementById("favoriteList");
const unreadList = document.getElementById("unreadList");
const readList = document.getElementById("readList");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let bookIdToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
});

// Submit form
bookForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const bookId = document.getElementById("bookId").value.trim();
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const genre = document.getElementById("genre").value.trim();
  const status = document.getElementById("status").value;
  const imageInput = document.getElementById("image");

  if (!title || !author || !genre) {
    alert("All fields are required!");
    return;
  }

  const imageFile = imageInput.files[0];
  if (imageFile) {
    const reader = new FileReader();
    reader.onloadend = function () {
      saveBook(bookId, title, author, genre, status, reader.result);
    };
    reader.readAsDataURL(imageFile);
  } else {
    saveBook(bookId, title, author, genre, status, "");
  }
});

function saveBook(bookId, title, author, genre, status, image) {
  let books = JSON.parse(localStorage.getItem("books")) || [];

  if (bookId) {
    books = books.map(book =>
      book.id === bookId
        ? { ...book, title, author, genre, status, image: image || book.image }
        : book
    );
  } else {
    const newBook = {
      id: crypto.randomUUID(),
      title,
      author,
      genre,
      status,
      image,
      favorite: false
    };
    books.push(newBook);
  }

  localStorage.setItem("books", JSON.stringify(books));
  loadBooks();
  bookForm.reset();
  document.getElementById("bookId").value = "";
  document.querySelector(".modal-title").innerText = "Add Book";
  document.getElementById("submitBookBtn").innerText = "Save Book";
  bootstrap.Modal.getInstance(document.getElementById("addBookModal")).hide();
}

function openAddBookModal() {
  bookForm.reset();
  document.getElementById("bookId").value = "";
  document.querySelector(".modal-title").innerText = "Add Book";
  document.getElementById("submitBookBtn").innerText = "Save Book";
  let modal = new bootstrap.Modal(document.getElementById("addBookModal"));
  modal.show();
}

function openEditBookModal(bookId) {
  let books = JSON.parse(localStorage.getItem("books")) || [];
  let book = books.find(b => b.id === bookId);
  if (!book) return console.error("Book not found");

  document.getElementById("bookId").value = book.id;
  document.getElementById("title").value = book.title;
  document.getElementById("author").value = book.author;
  document.getElementById("genre").value = book.genre;
  document.getElementById("status").value = book.status;

  document.querySelector(".modal-title").innerText = "Edit Book";
  document.getElementById("submitBookBtn").innerText = "Update Book";

  let modal = new bootstrap.Modal(document.getElementById("addBookModal"));
  modal.show();
}

function loadBooks() {
  let books = JSON.parse(localStorage.getItem("books")) || [];

  bookList.innerHTML = "";
  favoriteList.innerHTML = "";
  unreadList.innerHTML = "";
  readList.innerHTML = "";

  books.forEach(book => {
    const bookCard = createBookCard(book);
    bookList.appendChild(bookCard);

    if (book.favorite) favoriteList.appendChild(createBookCard(book));
    if (book.status === "Unread") unreadList.appendChild(createBookCard(book));
    else if (book.status === "Read") readList.appendChild(createBookCard(book));
  });
}

function toggleFavorite(bookId) {
  let books = JSON.parse(localStorage.getItem("books")) || [];
  books = books.map(book =>
    book.id === bookId ? { ...book, favorite: !book.favorite } : book
  );
  localStorage.setItem("books", JSON.stringify(books));
  loadBooks();
}

function createBookCard(book) {
  const card = document.createElement("div");
  card.className = "col-md-3 mb-3 book-card";
  card.innerHTML = `
    <div class="card shadow-sm">
      <img src="${book.image || "cover-placeholder.jpg"}" class="card-img-top" alt="Book Cover">
      <div class="card-body">
        <h5 class="card-title book-title">${book.title}</h5>
        <p class="card-text book-author">Author: ${book.author}</p>
        <p class="card-text"><small>Genre: ${book.genre}</small></p>
        <p class="card-text"><small>Status: ${book.status}</small></p>
        <button class="btn btn-sm btn-danger" onclick="confirmDelete('${book.id}')">Delete</button>
        <button class="btn btn-sm btn-info" onclick="openEditBookModal('${book.id}')">Edit</button>
        <button class="btn btn-sm ${book.favorite ? "btn-warning" : "btn-outline-warning"}" onclick="toggleFavorite('${book.id}')">
          ${book.favorite ? "Unfavorite" : "Favorite"}
        </button>
      </div>
    </div>
  `;
  return card;
}

function confirmDelete(bookId) {
  bookIdToDelete = bookId;
  const modal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
  modal.show();
}

confirmDeleteBtn.addEventListener("click", () => {
  if (!bookIdToDelete) return;

  let books = JSON.parse(localStorage.getItem("books")) || [];
  books = books.filter(book => book.id !== bookIdToDelete);
  localStorage.setItem("books", JSON.stringify(books));
  loadBooks();

  bookIdToDelete = null;
  bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal")).hide();
});

// Universal search function for tabs
function searchBooks(input, tab) {
  const query = input.value.toLowerCase().trim();
  const books = JSON.parse(localStorage.getItem("books")) || [];
  let filteredBooks = [];

  switch (tab) {
    case 'favorites':
      filteredBooks = books.filter(book =>
        book.favorite &&
        (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query))
      );
      favoriteList.innerHTML = filteredBooks.length
        ? filteredBooks.map(book => createBookCard(book).outerHTML).join("")
        : `<p class="text-center text-muted">No books found in Favorites</p>`;
      break;

    case 'unread':
      filteredBooks = books.filter(book =>
        book.status === "Unread" &&
        (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query))
      );
      unreadList.innerHTML = filteredBooks.length
        ? filteredBooks.map(book => createBookCard(book).outerHTML).join("")
        : `<p class="text-center text-muted">No unread books found</p>`;
      break;

    case 'read':
      filteredBooks = books.filter(book =>
        book.status === "Read" &&
        (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query))
      );
      readList.innerHTML = filteredBooks.length
        ? filteredBooks.map(book => createBookCard(book).outerHTML).join("")
        : `<p class="text-center text-muted">No read books found</p>`;
      break;

    default:
      filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
      );
      bookList.innerHTML = filteredBooks.length
        ? filteredBooks.map(book => createBookCard(book).outerHTML).join("")
        : `<p class="text-center text-muted">No books found</p>`;
  }
}
