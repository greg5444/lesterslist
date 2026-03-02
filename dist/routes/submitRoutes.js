"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/submitRoutes.js
const express_1 = __importDefault(require("express"));
const submitController_js_1 = require("../controllers/submitController.js");
const router = express_1.default.Router();
router.get('/', submitController_js_1.showSubmitHub);
router.get('/festival', submitController_js_1.showFestivalForm);
router.post('/festival', submitController_js_1.submitFestival);
router.get('/band', submitController_js_1.showBandForm);
router.post('/band', submitController_js_1.submitBand);
router.get('/camp', submitController_js_1.showCampForm);
router.post('/camp', submitController_js_1.submitCamp);
router.get('/venue', submitController_js_1.showVenueForm);
router.post('/venue', submitController_js_1.submitVenue);
router.get('/photos', submitController_js_1.showPhotosForm);
router.post('/photos', submitController_js_1.submitPhotos);
exports.default = router;
// Note: /report GET+POST are mounted separately in server.js at top level
// so that ?type=concert&id=123 links from any public page work cleanly.
