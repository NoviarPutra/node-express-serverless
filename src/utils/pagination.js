module.exports = {
  getPaginationParams: (query) => {
    const { page = 1, limit = 10 } = query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    if (isNaN(pageNumber) || isNaN(limitNumber) || pageNumber < 1 || limitNumber < 1) {
      throw new Error("Page and limit must be positive integers");
    }

    const skip = (pageNumber - 1) * limitNumber;
    const take = limitNumber;

    return { skip, take, pageNumber, limitNumber };
  },

  getPaginationMetadata: (totalItems, pageNumber, limitNumber) => {
    const totalPages = Math.ceil(totalItems / limitNumber);
    return {
      totalItems,
      totalPages,
      currentPage: pageNumber,
      pageSize: limitNumber,
    };
  },
};
