type MaybeHasDate = {
  date?: Date
};

export const sortDateDesc = (a: MaybeHasDate, b: MaybeHasDate) => {
  // if both elements have dates, return numeric sort (desc) based on epoch
  if (a.date && b.date) return b.date.valueOf() - a.date.valueOf();
  // keep original order if no dates
  if (!a.date && !b.date) return 0;
  // if a has a date (but b doesn't), sort b before a
  if (a.date) return 1;
  // sort a before b, since here b has a date and a doesn't
  return -1;
};
