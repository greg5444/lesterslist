"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/bandRoutes.js
const express_1 = __importDefault(require("express"));
const bandController_js_1 = require("../controllers/bandController.js");
const router = express_1.default.Router();
// GET /bands (must be before :id route)
router.get('/', bandController_js_1.listBands);
// GET /bands/:id
router.get('/:id', bandController_js_1.showBand);
exports.default = router;
