"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sortFunctions = {
    'Total Posts': (a, b) => a.post.total - b.post.total,
    'Active Posts': (a, b) => a.post.active > b.post.active,
    'Archived Posts': (a, b) => a.post.archived > b.post.archived,
    'Trashed Posts': (a, b) => a.post.deleted > b.post.deleted,
    Registered: (a, b) => b.created_at - a.created_at,
    Mobile: (a, b) => b.phone.localeCompare(a.phone),
};
exports.default = sortFunctions;
//# sourceMappingURL=sortUsersFunctions.js.map