module.exports = {
  getPaginationParams: (query) => {
    let { page, limit, skip } = query;

    page = page ? parseInt(page, 10) : undefined;
    limit = limit ? parseInt(limit, 10) : 10;
    skip = skip ? parseInt(skip, 10) : undefined;

    if (isNaN(limit) || limit < 1) {
      throw new Error("Limit must be a positive integer");
    }

    if (page !== undefined) {
      if (isNaN(page) || page < 1) {
        throw new Error("Page must be a positive integer");
      }
      skip = (page - 1) * limit;
    }

    if (skip !== undefined && (isNaN(skip) || skip < 0)) {
      throw new Error("Skip must be a non-negative integer");
    }

    return { skip: skip || 0, take: limit, pageNumber: page || 1, limitNumber: limit };
  },

  getPaginationMetadata: (totalItems, pageNumber, limitNumber) => {
    const totalPages = Math.ceil(totalItems / limitNumber);
    return {
      total: totalItems,
      total_pages: totalPages,
      page: pageNumber,
      limit: limitNumber,
    };
  },
};
