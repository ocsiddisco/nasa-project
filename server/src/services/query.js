// this file gives reusable way of making end point -> pagination for history launch page
const DEFAULT_PAGE_NUMBER = 1;

const DEFAULT_PAGE_LIMIT = 0;

function getPagination(query) {
  // math.abs returns the absolute value of a number, if number negative, it turns it positif, if number is in a string it turns it in a number (for myself:type coercion)
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  // calculate the nomber of documents to skip depending of the page
  // if page 1: (1 - 1) * limit = 0, won't skip document (no needed)
  // if page 2: (2 - 1) * limit = 50, will skip the first 50 documents. etc
  const skip = (page - 1) * limit;

  return { skip, limit };
}

module.exports = { getPagination };
