type SortFunctionKey = 'Total Posts' | 'Active Posts' | 'Archived Posts' | 'Trashed Posts' | 'Registered' | 'Mobile';

type SortFunction = (a: any, b: any) => number | boolean;

type SortFunctionMap = {
  [key in SortFunctionKey]: SortFunction;
};

const sortFunctions: SortFunctionMap = {
  'Total Posts': (a, b) => a.post.total - b.post.total,
  'Active Posts': (a, b) => a.post.active > b.post.active,
  'Archived Posts': (a, b) => a.post.archived > b.post.archived,
  'Trashed Posts': (a, b) => a.post.deleted > b.post.deleted,
  Registered: (a, b) => b.created_at - a.created_at,
  Mobile: (a, b) => b.phone.localeCompare(a.phone),
};

export default sortFunctions;
