/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-return-assign */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-nested-ternary */
const { nanoid } = require('nanoid');
const books = require('./books');

const addBooksHandler = (request, h) => {
  const {
    name, year,
    author, summary,
    publisher, pageCount,
    readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const fail = (pesan) => {
    const response = h.response({
      status: 'fail',
      message: pesan,
    });
    response.code(400);
    return response;
  };

  if (name === undefined) return fail('Gagal menambahkan buku. Mohon isi nama buku');
  if (pageCount < readPage) return fail('Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount');

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });

    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const key = Object.keys(request.query)[0];
  const val = Object.values(request.query)[0];
  const arr = [];

  const filter = books.reduce((result, book) => {
    const query = key === undefined ? ''
      : isNaN(val) ? `${val}`
        : !!+val;

    const check = book[key] === query ? true
      : book.name.search(new RegExp(val, 'i')) > -1;

    if (book[key] !== undefined && !check) return arr;

    const { id, name, publisher } = book;
    arr.push({ id, name, publisher });
    return arr;
  }, []);

  const response = h.response({
    status: 'success',
    data: {
      books: filter,
    },
  });
  response.code(200);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((b) => b.id === id)[0];

  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name, year, author, summary,
    publisher, pageCount, readPage, reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((b) => b.id === id);

  const responseHandler = (code, status, message) => {
    const response = h.response({
      status,
      message,
    });
    response.code(code);
    return response;
  };

  return name === undefined ? responseHandler(400, 'fail', 'Gagal memperbarui buku. Mohon isi nama buku')
    : readPage > pageCount ? responseHandler(400, 'fail', 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount')
      : index === -1 ? responseHandler(404, 'fail', 'Gagal memperbarui buku. Id tidak ditemukan')
        : (books[index] = {
          ...books[index], name, year, author, summary, publisher, pageCount, readPage, reading, updatedAt,
        },
        responseHandler(200, 'success', 'Buku berhasil diperbarui')
        );
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.findIndex((b) => b.id === id);

  if (book !== -1) {
    books.splice(book, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBooksHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
