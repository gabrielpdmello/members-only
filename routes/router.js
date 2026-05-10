const { Router } = require("express");
const controller = require("../controllers/controller");
const router = Router();
const session = require("express-session");
const passport = require("../db/passport")
const flash = require('connect-flash');

router.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
router.use(flash());
router.use(passport.session());

router.use(controller.locals);

router.get('/', controller.index);

router.get('/signup', controller.getSignup);
router.post('/signup', controller.postSignup);

router.get('/login', controller.getLogin);
router.post( "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  }))

router.get("/logout", controller.logout);

router.get("/vip", controller.getVip);
router.post("/vip", controller.postVip);

router.get("/admin", controller.getAdmin);
router.post("/admin", controller.postAdmin);

router.get("/newmessage", controller.getNewMessage);
router.post("/newmessage", controller.postNewMessage);

router.post('/delete-message', controller.postDeleteMsg);

router.use(controller.errorHandler);

module.exports = router;