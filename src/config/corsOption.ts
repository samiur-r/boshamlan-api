const whitelist = ['https://www.yoursite.com', 'http://127.0.0.1:5500', 'http://localhost:3500'];

const corsOptions = {
  origin: (origin: string, callback: (arg0: Error | null, arg1: boolean | undefined) => void) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), undefined);
    }
  },
  optionsSuccessStatus: 200,
};

export default corsOptions;
