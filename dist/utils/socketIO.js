"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketIo = exports.initializeSocketIO = void 0;
const socket_io_1 = require("socket.io");
const corsOption_1 = __importDefault(require("../config/corsOption"));
const logger_1 = __importDefault(require("./logger"));
let socketIoObj = null;
const initializeSocketIO = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: corsOption_1.default,
    });
    io.on('connection', (socket) => {
        socketIoObj = socket;
        logger_1.default.info(`A new socket is connected: ${socket.id}`);
        socket.on('disconnect', () => {
            logger_1.default.info(`Socket ${socket.id} is disconnected`);
        });
        socket.emit('socket_connection_established');
    });
    return io;
};
exports.initializeSocketIO = initializeSocketIO;
const getSocketIo = () => {
    // Return a promise that resolves with the socket when the connection is established
    return new Promise((resolve) => {
        if (socketIoObj) {
            resolve(socketIoObj);
        }
        else {
            // If socketIoObj is null, wait for the 'socket_connection_established' event to be emitted
            // before resolving the promise with the socket
            const listener = () => {
                resolve(socketIoObj);
                socketIoObj === null || socketIoObj === void 0 ? void 0 : socketIoObj.off('socket_connection_established', listener);
            };
            socketIoObj === null || socketIoObj === void 0 ? void 0 : socketIoObj.on('socket_connection_established', listener);
        }
    });
};
exports.getSocketIo = getSocketIo;
//# sourceMappingURL=socketIO.js.map