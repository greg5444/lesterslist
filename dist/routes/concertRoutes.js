"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/concertRoutes.js
const express_1 = __importDefault(require("express"));
const concertController_js_1 = require("../controllers/concertController.js");
const router = express_1.default.Router();
// GET /concerts (must be before :id route)
router.get('/', concertController_js_1.listConcerts);
// GET /concerts/:id
router.get('/:id', concertController_js_1.showConcert);
exports.default = router;
