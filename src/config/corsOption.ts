const whitelist = [
  'https://www.yoursite.com',
  'http://127.0.0.1:3000',
  'http://localhost:3000',
  'https://ae4d-27-147-186-203.ap.ngrok.io',
];

const corsOptions = {
  origin: whitelist,
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
