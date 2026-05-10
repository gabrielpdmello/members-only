const db = require("../db/queries");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
require('dotenv').config();

const validateSignup = [
    body('username').trim()
        .isLength({ min: 1, max: 30 }).withMessage('Username must be between 1 and 30 characters.')
        .custom(value => !/\s/.test(value)).withMessage('Username must not contain spaces.')
        .custom(async value => {
            const profile = await db.getUsername(value);
            if (profile[0]) {
                throw new Error("Username is already in use, choose another!")
            }
        }),
    body('password').trim()
        .isLength({ min: 1, max: 30 }).withMessage('Password must be between 1 and 30 characters.'),
    body('confirmPassword').custom((value, {req}) => {
        return value === req.body.password;
    }).withMessage('Passwords do not match'),
];

const validateVip = [
    body('vipPassword').trim().toLowerCase()
        .custom(value => {
            const match = process.env.VIP_PASSCODE === value;
            if(!match) {
                throw new Error("Wrong.")
            }
            return true
        })
];

const validateAdmin = [
    body('adminPassword').trim()
        .custom(value => {
            const match = process.env.ADMIN_PSW === value;
            if(!match) {
                throw new Error("Incorrect password.")
            }
            return true
        })
];

const validateMessage = [
    body('message-text').trim()
        .isLength({ min: 1, max: 1000 }).withMessage('Message must be between 1 and 1000 characters.')
];

async function locals(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errorMessage = req.flash('error');
  next();
}

function errorHandler(err, req, res, next) {
    res.status(500)
    res.render('error', { error: err, repoUrl: process.env.REPO_URL })

}

async function index(req, res) {
    const rows = await db.getAllMessages();

    if (!req.isAuthenticated()) {
        rows.forEach(item => {
            item.username = '***';
            item.added = '***, ***';
        })
    } else if (!req.user.vip) {
        rows.forEach(item => {
            if (req.user.username == item.username) {
                return
            }
            item.username = '***';
            item.added = '***, ***';
        })
    }

    res.render("index", { messages: rows });
}

async function getSignup(req, res) {
    res.render("signup");
}

const postSignup = [
    validateSignup,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("signup", {
                errors: errors.array(),
            });
        }
        try {
        const username = req.body.username;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        db.createUser(username, hashedPassword)
        res.redirect("/");
        } catch (error) {
            next(error);
        }
    }
]

async function getLogin(req, res) {
    res.render("login");
}

async function logout(req, res, next) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
    })
}

async function getVip(req, res, next) {
    res.render("vip", {hint: process.env.VIP_HINT});
}

const postVip = [
    validateVip,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("vip", {
                errors: errors.array(),
                hint: process.env.VIP_HINT
            });
        }
        try {
            const id = req.body.id;
            await db.addVip(id);
            res.redirect("/vip");
        } catch (error) {
            next(error);
        }
    }
]

async function getAdmin(req, res, next) {
    res.render("admin");
}

const postAdmin = [
    validateAdmin,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("admin", {
                errors: errors.array()
            });
        }
        try {
            const id = req.body.id;
            await db.addAdmin(id);
            res.redirect("/admin");
        } catch (error) {
            next(error);
        }
    }
]

async function getNewMessage(req, res, next) {
    res.render("newmessage");
}

const postNewMessage = [
    validateMessage,
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("newmessage", {
                inputsError: errors.array(),
                errors: errors.array()
            });
        }
        try {
            const userId = req.body.id;
            const message = req.body['message-text'];
            await db.addMessage(message, userId);
            res.redirect("/");
        } catch (error) {
            next(error);
        }
    }
]

async function postDeleteMsg(req, res, next) {
    try {
        const messageId = req.body.messageId;
        await db.deleteMessage(messageId);
        res.redirect("/");
    } catch (error) {
        next(error);
    }
}

module.exports = {
    locals,
    errorHandler,
    index,
    getSignup,
    postSignup,
    getLogin,
    logout,
    getVip,
    postVip,
    getAdmin,
    postAdmin,
    getNewMessage,
    postNewMessage,
    postDeleteMsg
}