import multer from 'multer';
import * as path from 'path';

const storage = multer.diskStorage({
  destination(req: any, _file: any, cb: (arg0: null, arg1: string) => void) {
    const pathName = '../boshamlan-frontend/public/images/';
    let dir = '';

    if (req.originalUrl === '/api/v1/agent') dir = 'agents/';
    cb(null, `${pathName}${dir}`);
  },
  filename(_req: any, file: { fieldname: any; originalname: any }, cb: (arg0: null, arg1: string) => void) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

export default upload;
