const paginate = async (model, query = {}, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = options.sort || { createdAt: -1 };
  const populate = options.populate || '';
  const select = options.select || '';

  const total = await model.countDocuments(query);
  let dbQuery = model.find(query).sort(sort).skip(skip).limit(limit);

  if (populate) dbQuery = dbQuery.populate(populate);
  if (select) dbQuery = dbQuery.select(select);

  const data = await dbQuery;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

module.exports = paginate;
