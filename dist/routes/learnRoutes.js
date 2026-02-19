"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/learnRoutes.js
const express_1 = __importDefault(require("express"));
const learnController_js_1 = require("../controllers/learnController.js");
const router = express_1.default.Router();
router.get('/', learnController_js_1.listLearn);
router.get('/new', learnController_js_1.showLearnForm);
router.post('/new', learnController_js_1.submitLearn);
exports.default = router;
