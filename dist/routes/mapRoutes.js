"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/mapRoutes.js
const express_1 = __importDefault(require("express"));
const mapController_js_1 = require("../controllers/mapController.js");
const router = express_1.default.Router();
// GET /map - Events map view
router.get('/', mapController_js_1.showMap);
exports.default = router;
