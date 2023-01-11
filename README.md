# Boshamlan Backend

## Features

- 🚀 Based on latest [Express.js](https://expressjs.com/)
- 💅 Object–relational mapping(ORM) with [TypeORM](https://typeorm.io/)
- ✳️ DB: [PostgreSQL](https://www.postgresql.org/)
- 🐻 Logging with [Winston](https://github.com/winstonjs/winston) and [Morgan](https://www.npmjs.com/package/morgan)
- ▲ Data Validation using [Yup](https://www.npmjs.com/package/yup)
- 🐐 Unit testing with [Jest](https://github.com/facebook/jest) & [SuperTest](https://www.npmjs.com/package/supertest)
- ⚡️ E2E testing with [Cypress](https://www.cypress.io/)

### Design Patterns

- ⛔ **[ESLint](https://eslint.org)** – Find and fix problems in your JavaScript code. Following Airbnb style guide.
- 🎀 **[Prettier](https://prettier.io)** – An opinionated code formatter, supporting multiple languages and code editors
- 🐺 **[Husky](https://github.com/typicode/husky)** – Modern native Git hooks made easy
- 💩 **[lint-staged](https://github.com/okonet/lint-staged)** – Run linters against staged git files and don't let 💩 slip into your code base
- 📓 **[commitlint](https://commitlint.js.org)** – Helps your team adhering to a commit convention

## Getting started

```
git clone https://github.com/q8villa/boshamlan-backend.git
cd boshamlan-backend
npm i
cp .env.example .env
npm run start:dev
```

Then open `http://localhost:5000/` to see the app.

### build

Builds the production application in the .next folder.

```bash
npm run build
```

### start

Starts the application in production mode.

```bash
npm run start:prod
```

### lint

Runs ESLint static code analysis based on your `.eslintrc` configuration

```bash
npm run lint
```

### test

Runs Jest unit tests to validate changes between commits

```bash
npm run test
```

### Contributing

- Create a new branch from 'develop' with a standard name(e.g. feat/create-x-feature, hotfix/x-bug).
- Code, test, commit and push your branch. Create a PR into 'develop'.
- Ask for PR review from an appropriate reviewer.
