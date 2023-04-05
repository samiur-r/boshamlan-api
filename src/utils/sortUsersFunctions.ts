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
  Registered: (a, b) => {
    if (a.status === 'verified' && b.status === 'not_verified') {
      return -1;
    }
    if (a.status === 'not_verified' && b.status === 'verified') {
      return 1;
    }
    return 0;
  },
  Mobile: (a, b) => b.phone.localeCompare(a.phone),
};

export default sortFunctions;
