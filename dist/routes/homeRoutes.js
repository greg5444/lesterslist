"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/homeRoutes.js
const express_1 = __importDefault(require("express"));
const homeController_js_1 = require("../controllers/homeController.js");
const router = express_1.default.Router();
router.get('/', homeController_js_1.showHome);
router.get('/contact', homeController_js_1.showContact);
router.get('/about', homeController_js_1.showAbout);
exports.default = router;
