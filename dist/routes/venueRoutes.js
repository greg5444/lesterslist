"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/venueRoutes.js
const express_1 = __importDefault(require("express"));
const venueController_js_1 = require("../controllers/venueController.js");
const router = express_1.default.Router();
// GET /venues/:id
router.get('/:id', venueController_js_1.showVenue);
exports.default = router;
