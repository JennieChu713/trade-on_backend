export const optionsSetup = (
  page,
  size,
  select = "",
  populate = "",
  sort = { updatedAt: -1 }
) => {
  const limit = size ? +size : 5;
  const offset = page ? (page - 1) * limit : 0;
  return {
    select,
    populate,
    limit,
    offset,
    sort,
  };
};

export const paginateObject = (totalDocs, limit, page) => {
  return {
    total: totalDocs,
    itemPerPage: limit,
    currentPage: page,
    allPages: Math.ceil(totalDocs / limit),
  };
};
