const {
  listBooks,
  findBook,
  listAuthors,
  findAuthor,
  booksByAuthor,
  createBook,
} = require("./data");
const { publishBookCreated } = require("./producer");

const typeDefs = `#graphql
  type Author {
    id: ID!
    name: String!
    books: [Book!]!
  }

  type Book {
    id: ID!
    title: String!
    year: Int!
    author: Author!
  }

  type Query {
    books: [Book!]!
    book(id: ID!): Book
    authors: [Author!]!
    author(id: ID!): Author
  }

  type Mutation {
    createBook(title: String!, year: Int!, authorId: ID!): Book!
  }
`;

const resolvers = {
  Query: {
    books: () => listBooks(),
    book: (_, { id }) => findBook(id),
    authors: () => listAuthors(),
    author: (_, { id }) => findAuthor(id),
  },
  Mutation: {
    createBook: async (_, { title, year, authorId }) => {
      const author = findAuthor(authorId);
      if (!author) {
        throw new Error(`Автор с id=${authorId} не найден`);
      }

      const book = createBook({ title, year, authorId });
      await publishBookCreated(book);
      return book;
    },
  },
  Book: {
    author: (book) => findAuthor(book.authorId),
  },
  Author: {
    books: (author) => booksByAuthor(author.id),
  },
};

module.exports = { typeDefs, resolvers };
