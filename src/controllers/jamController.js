// src/controllers/jamController.js
import LocalJam from '../models/localJamModel.js';
import { sendJamNotification } from '../config/email.js';

export async function listJams(req, res) {
  const jams = await LocalJam.findPublished();
  res.render('jams/index', { title: 'Local Jams', jams });
}

export function showJamForm(req, res) {
  res.render('jams/new', { title: 'Submit a Jam', success: false, error: null });
}

export async function submitJam(req, res) {
  const { JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress } = req.body;
  
  // Validate required fields
  if (!JamName || !VenueName || !Schedule || !ContactName || !ContactEmail || !ContactPhone) {
    return res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'Required fields are missing.' });
  }

  const locationMissing = !City || !City.trim() || !State || !State.trim() || !Zip || !Zip.trim() || !GoogleMapAddress || !GoogleMapAddress.trim();
  if (locationMissing) {
    return res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'Location details are required for the map.' });
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(ContactEmail)) {
    return res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'Please enter a valid email address.' });
  }
  
  try {
    // Save jam to database as Draft
    const jamData = {
      JamName,
      VenueName,
      Schedule,
      AllWelcome: AllWelcome === 'on' || AllWelcome === '1' || AllWelcome === true,
      BeginnersWelcome: BeginnersWelcome === 'on' || BeginnersWelcome === '1' || BeginnersWelcome === true,
      AdvancedOnly: AdvancedOnly === 'on' || AdvancedOnly === '1' || AdvancedOnly === true,
      ContactName,
      ContactEmail,
      ContactPhone,
      ShowPhone: ShowPhone === 'on' || ShowPhone === '1' || ShowPhone === true,
      City,
      State,
      Zip,
      GoogleMapAddress
    };
    
    await LocalJam.create(jamData);
    
    // Send email notification to admin
    const emailResult = await sendJamNotification(jamData);
    
    if (!emailResult.success) {
      console.error('Email notification failed:', emailResult.error);
      // Still show success to user even if email fails
    }
    
    res.render('jams/new', { title: 'Submit a Jam', success: true, error: null });
  } catch (error) {
    console.error('Error submitting jam:', error);
    res.render('jams/new', { title: 'Submit a Jam', success: false, error: 'An error occurred. Please try again.' });
  }
}
