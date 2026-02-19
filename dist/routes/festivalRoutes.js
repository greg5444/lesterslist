"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/festivalRoutes.js
const express_1 = __importDefault(require("express"));
const festivalController_js_1 = require("../controllers/festivalController.js");
const router = express_1.default.Router();
// GET /festivals (must be before :id route)
router.get('/', festivalController_js_1.listFestivals);
// GET /festivals/:id
router.get('/:id', festivalController_js_1.showFestival);
exports.default = router;
