"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/campRoutes.js
const express_1 = __importDefault(require("express"));
const campController_js_1 = require("../controllers/campController.js");
const router = express_1.default.Router();
// GET /camps
router.get('/', campController_js_1.listCamps);
// GET /camps/:id
router.get('/:id', campController_js_1.showCamp);
exports.default = router;
