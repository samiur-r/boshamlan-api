import multer from 'multer';

// const storage = multer.diskStorage({
//   destination(req: any, _file: any, cb: (arg0: null, arg1: string) => void) {
//     const pathName = '../boshamlan-frontend/public/images/';
//     let dir = '';
//     const endpoint = req.originalUrl.substr(8, req.originalUrl.length);

//     if (endpoint === 'agent') dir = 'agents/';
//     else if (endpoint === 'post' || endpoint === 'post/temp') dir = 'posts/';

//     cb(null, `${pathName}${dir}`);
//   },
//   filename(req: any, file: { fieldname: any; originalname: any }, cb: (arg0: null, arg1: string) => void) {
//     let endpoint = req.originalUrl.substr(8, req.originalUrl.length);

//     if (endpoint === 'post/temp') endpoint = 'post';

//     cb(null, `${endpoint}s-${Date.now()}${path.extname(file.originalname)}`);
//   },
// });

const storage = multer.memoryStorage();
const upload = multer({ storage });

export default upload;
