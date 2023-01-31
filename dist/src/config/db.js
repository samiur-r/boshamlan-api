"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const model_1 = require("../api/v1/users/model");
const model_2 = require("../api/v1/credits/model");
const model_3 = require("../api/v1/otps/model");
const model_4 = require("../api/v1/agents/model");
const model_5 = require("../api/v1/transactions/model");
const model_6 = require("../api/v1/packages/model");
const model_7 = require("../api/v1/categories/model");
const model_8 = require("../api/v1/property_types/model");
const model_9 = require("../api/v1/regions/model");
const model_10 = require("../api/v1/posts/model");
const model_11 = require("../api/v1/multimedia/model");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT) || 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB || 'boshamlan_dev',
    synchronize: true,
    logging: false,
    entities: [
        model_1.User,
        model_2.Credit,
        model_3.Otp,
        model_4.Agent,
        model_5.Transaction,
        model_6.Package,
        model_7.Category,
        model_8.PropertyType,
        model_9.Region,
        model_10.Post,
        model_11.Multimedia,
        model_11.PostMultimedia,
    ],
});
exports.default = AppDataSource;
//# sourceMappingURL=db.js.map