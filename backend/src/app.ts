import path from "path";
import express, { Request, Response, NextFunction } from "express"; 'express'


// const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json())


const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

app.use(cors());

// test comment

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

module.exports = {
    getIo: () => {
        return io
    }
}

// serving static files
app.use(express.static(path.join(__dirname, 'public')))

const routes = require('./routes')
app.use(routes)

// Catch unhandled requests and forward to error handler.
app.use((_req, _res, next) => {
    const err = new Error("The requested resource couldn't be found") as any
    err.title = "Resource not found"
    err.errors = ["The requested resource couldn't be found"]
    err.status = 404
    next(err)
})

// Error formatter
app.use((err: any, _req: Request, res: Response, _next: NextFunction): any => {
    res.status(err.status || 500);
    console.error(err);
    console.log('IS IN ERROR ROUTE')
    res.json({
        title: err.title || 'Server Error',
        message: err.message,
        errors: err.errors,
        stack: err.stack
    });
});


const port = process.env.PORT || 3001;
server.listen(port, () => {
    console.log(`SERVER IS RUNNING on ${port}`);
});



// const express = require('express');
// const morgan = require('morgan');
// const cookieParser = require('cookie-parser');


// const app = express();

// app.use(morgan('dev'));
// app.use(cookieParser());
// app.use(express.json())

// // serving static files
// app.use(express.static('public'))

// const routes = require('./routes')
// app.use(routes)

// // Catch unhandled requests and forward to error handler.
// app.use((_req, _res, next) => {
//     const err = new Error("The requested resource couldn't be found")
//     err.title = "Resource not found"
//     err.errors = ["The requested resource couldn't be found"]
//     err.status = 404
//     next(err)
// })

// // Error formatter
// app.use((err, _req, res, _next) => {
//     res.status(err.status || 500);
//     console.error(err);
//     console.log('IS IN ERROR ROUTE')
//     res.json({
//         title: err.title || 'Server Error',
//         message: err.message,
//         errors: err.errors,
//         stack: err.stack
//     });
// });


// module.exports = app;

export { }
