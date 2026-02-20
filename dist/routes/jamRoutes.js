"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/jamRoutes.js
const express_1 = __importDefault(require("express"));
const jamController_js_1 = require("../controllers/jamController.js");
const router = express_1.default.Router();
const jamController_js_2 = require("../controllers/jamController.js");
router.get('/', jamController_js_1.listJams);
router.get('/new', jamController_js_1.showJamForm);
router.post('/new', jamController_js_1.submitJam);
router.get('/:JamID', jamController_js_2.showJamDetail);
exports.default = router;
