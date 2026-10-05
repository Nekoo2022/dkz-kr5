const authors = [
  { id: "1", name: "Лев Толстой" },
  { id: "2", name: "Фёдор Достоевский" },
];

const books = [
  { id: "1", title: "Война и мир", year: 1869, authorId: "1" },
  { id: "2", title: "Анна Каренина", year: 1877, authorId: "1" },
  { id: "3", title: "Преступление и наказание", year: 1866, authorId: "2" },
];

let nextBookId = books.length + 1;

function listBooks() {
  return books;
}

function findBook(id) {
  return books.find((book) => book.id === id) ?? null;
}

function listAuthors() {
  return authors;
}

function findAuthor(id) {
  return authors.find((author) => author.id === id) ?? null;
}

function booksByAuthor(authorId) {
  return books.filter((book) => book.authorId === authorId);
}

function createBook({ title, year, authorId }) {
  const book = {
    id: String(nextBookId++),
    title,
    year,
    authorId,
  };
  books.push(book);
  return book;
}

module.exports = {
  listBooks,
  findBook,
  listAuthors,
  findAuthor,
  booksByAuthor,
  createBook,
};
