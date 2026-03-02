// src/controllers/adminController.js
import User from '../models/userModel.js';
import SiteSettings from '../models/siteSettingsModel.js';
import pool from '../config/database.js';

// Helper: safely parse ResourceSubmissions.SubmissionData JSON
function parseSubmission(row) {
  let data = {};
  try { data = JSON.parse(row.SubmissionData || '{}'); } catch (_) {}
  const label =
    data.FestivalName || data.BandName || data.EventName ||
    data.VenueName    || data.RelatedName ||
    (data.SourceType ? `${data.SourceType} #${data.SourceID}` : null) || '—';
  return { ...row, data, label };
}

export function showLogin(req, res) {
  res.render('admin/login', { title: 'Admin Login', error: null });
}

export async function handleLogin(req, res) {
  const { username, password } = req.body;
  const user = await User.findByUsername(username);
  if (!user || !(await User.verifyPassword(password, user.PasswordHash))) {
    return res.render('admin/login', { title: 'Admin Login', error: 'Invalid credentials' });
  }
  req.session.userId = user.UserID;
  req.session.username = user.Name || user.Email;
  res.redirect('/admin/dashboard');
}

export function handleLogout(req, res) {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
}

export async function showDashboard(req, res) {
  try {
    // Approval Queue: Draft Jams
    const [draftJams] = await pool.query(
      "SELECT JamID, JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State FROM LocalJams WHERE Status = 'Draft' ORDER BY JamID DESC"
    );
    // Approval Queue: Draft Learn Resources
    const [draftLearn] = await pool.query(
      "SELECT id, InstructorName, CourseDescription, ExternalLink FROM LearnResources WHERE Status = 'Draft' ORDER BY id DESC"
    );
    // Quick Stats
    const [bandCount] = await pool.query('SELECT COUNT(*) as total FROM Bands');
    const [concertCount] = await pool.query('SELECT COUNT(*) as total FROM Concerts');
    const [festivalCount] = await pool.query('SELECT COUNT(*) as total FROM Festivals');

    // ResourceSubmissions counts (table may not exist yet — handle gracefully)
    let pendingSubmissions = 0;
    let pendingReports = 0;
    try {
      const [[sc]] = await pool.query(
        "SELECT COUNT(*) as total FROM ResourceSubmissions WHERE Status = 'Pending' AND SubmissionType != 'report'"
      );
      const [[rc]] = await pool.query(
        "SELECT COUNT(*) as total FROM ResourceSubmissions WHERE SubmissionType = 'report' AND Status = 'Pending'"
      );
      pendingSubmissions = sc.total;
      pendingReports = rc.total;
    } catch (_) { /* table doesn't exist yet */ }

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      username: req.session.username,
      draftJams,
      draftLearn,
      stats: {
        bands: bandCount[0].total,
        concerts: concertCount[0].total,
        festivals: festivalCount[0].total,
        pendingSubmissions,
        pendingReports
      }
    });
  } catch (err) {
    console.error('Error loading dashboard:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function approveItem(req, res) {
  const { type, id } = req.params;
  if (type === 'jam') {
    await pool.query(`UPDATE LocalJams SET Status = 'Published' WHERE JamID = ?`, [id]);
  } else {
    await pool.query(`UPDATE LearnResources SET Status = 'Published' WHERE id = ?`, [id]);
  }
  res.redirect('/admin/dashboard');
}

export async function deleteItem(req, res) {
  const { type, id } = req.params;
  if (type === 'jam') {
    await pool.query(`DELETE FROM LocalJams WHERE JamID = ?`, [id]);
  } else {
    await pool.query(`DELETE FROM LearnResources WHERE id = ?`, [id]);
  }
  res.redirect('/admin/dashboard');
}

export async function showEditJam(req, res) {
  try {
    const { id } = req.params;
    const [jams] = await pool.query(
      'SELECT * FROM LocalJams WHERE JamID = ?',
      [id]
    );
    
    if (jams.length === 0) {
      return res.status(404).send('Jam not found');
    }
    
    res.render('admin/edit-jam', {
      title: 'Edit Jam',
      jam: jams[0],
      username: req.session.username
    });
  } catch (err) {
    console.error('Error loading jam for edit:', err);
    res.status(500).send('Server error');
  }
}

export async function updateJam(req, res) {
  try {
    const { id } = req.params;
    const { JamName, VenueName, Schedule, AllWelcome, BeginnersWelcome, AdvancedOnly, ContactName, ContactEmail, ContactPhone, ShowPhone, City, State, Zip, GoogleMapAddress } = req.body;
    
    await pool.query(
      `UPDATE LocalJams SET 
        JamName = ?, 
        VenueName = ?, 
        Schedule = ?, 
        AllWelcome = ?, 
        BeginnersWelcome = ?, 
        AdvancedOnly = ?, 
        ContactName = ?, 
        ContactEmail = ?, 
        ContactPhone = ?, 
        ShowPhone = ?, 
        City = ?, 
        State = ?, 
        Zip = ?, 
        GoogleMapAddress = ?
      WHERE JamID = ?`,
      [JamName, VenueName, Schedule, AllWelcome ? 1 : 0, BeginnersWelcome ? 1 : 0, AdvancedOnly ? 1 : 0, ContactName, ContactEmail, ContactPhone, ShowPhone ? 1 : 0, City, State, Zip, GoogleMapAddress, id]
    );
    
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error updating jam:', err);
    res.status(500).send('Server error');
  }
}

export async function showEditLearn(req, res) {
  try {
    const { id } = req.params;
    const [resources] = await pool.query(
      'SELECT * FROM LearnResources WHERE id = ?',
      [id]
    );
    
    if (resources.length === 0) {
      return res.status(404).send('Resource not found');
    }
    
    res.render('admin/edit-learn', {
      title: 'Edit Learning Resource',
      resource: resources[0],
      username: req.session.username
    });
  } catch (err) {
    console.error('Error loading resource for edit:', err);
    res.status(500).send('Server error');
  }
}

export async function updateLearn(req, res) {
  try {
    const { id } = req.params;
    const { InstructorName, CourseDescription, ExternalLink } = req.body;
    
    await pool.query(
      `UPDATE LearnResources SET 
        InstructorName = ?, 
        CourseDescription = ?, 
        ExternalLink = ?
      WHERE id = ?`,
      [InstructorName, CourseDescription, ExternalLink, id]
    );
    
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error('Error updating resource:', err);
    res.status(500).send('Server error');
  }
}

export async function showTickerSettings(req, res) {
  try {
    const ticker = await SiteSettings.getTickerSettings();
    
    // Parse messages JSON if it exists
    let messages = [];
    if (ticker.ticker_text) {
      try {
        messages = JSON.parse(ticker.ticker_text);
      } catch (e) {
        // If not JSON, convert old format to new format
        messages = [{ text: ticker.ticker_text, url: '' }];
      }
    }
    
    res.render('admin/ticker-settings', {
      title: 'Ticker Settings',
      ticker: {
        enabled: ticker.ticker_enabled !== false,
        messages: messages,
        speed: ticker.ticker_speed || 'medium'
      },
      success: req.query.success === '1'
    });
  } catch (err) {
    console.error('Error loading ticker settings:', err);
    res.status(500).send('Server error');
  }
}

export async function saveTickerSettings(req, res) {
  try {
    const { enabled, messages, speed } = req.body;
    const updatedBy = req.session.username || 'admin';
    
    // Build JSON array from the 6 rows
    const tickerMessages = [];
    if (messages) {
      for (let i = 0; i < 6; i++) {
        if (messages[i] && messages[i].text && messages[i].text.trim()) {
          tickerMessages.push({
            text: messages[i].text.trim(),
            url: messages[i].url ? messages[i].url.trim() : ''
          });
        }
      }
    }
    
    // Save as JSON string
    const jsonString = JSON.stringify(tickerMessages);
    
    await SiteSettings.saveTickerSettings(
      enabled === 'true',
      jsonString,
      speed || 'medium',
      updatedBy
    );
    
    res.redirect('/admin/ticker?success=1');
  } catch (err) {
    console.error('Error saving ticker settings:', err);
    res.status(500).send('Server error');
  }
}

// ── Submissions Management ────────────────────────────────────────────────────

export async function showSubmissions(req, res) {
  const filter = req.query.filter || 'all'; // 'all' | 'submissions' | 'reports'
  try {
    let query = 'SELECT SubmissionId, SubmissionType, SubmissionData, ContactName, ContactEmail, ContactPhone, Status, SubmittedAt FROM ResourceSubmissions';
    if (filter === 'submissions') {
      query += " WHERE SubmissionType != 'report'";
    } else if (filter === 'reports') {
      query += " WHERE SubmissionType = 'report'";
    }
    query += ' ORDER BY SubmittedAt DESC';

    const [rows] = await pool.query(query);
    const submissions = rows.map(parseSubmission);

    res.render('admin/submissions', {
      title: 'Submissions',
      username: req.session.username,
      submissions,
      filter,
    });
  } catch (err) {
    console.error('Error loading submissions:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function showSubmissionDetail(req, res) {
  const { id } = req.params;
  const filter = req.query.filter || 'all';
  try {
    const [rows] = await pool.query(
      'SELECT SubmissionId, SubmissionType, SubmissionData, ContactName, ContactEmail, ContactPhone, Status, SubmittedAt FROM ResourceSubmissions WHERE SubmissionId = ?',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).render('404', { message: 'Submission not found' });
    }
    const submission = parseSubmission(rows[0]);
    res.render('admin/submission-detail', {
      title: `Submission #${id}`,
      username: req.session.username,
      submission,
      filter,
    });
  } catch (err) {
    console.error('Error loading submission detail:', err);
    res.status(500).render('500', { message: 'Server error' });
  }
}

export async function updateSubmissionStatus(req, res) {
  const { id } = req.params;
  const { status, filter } = req.body;
  const allowed = ['Reviewed', 'Hidden', 'Pending'];
  if (!allowed.includes(status)) return res.redirect('/admin/submissions');
  try {
    await pool.query('UPDATE ResourceSubmissions SET Status = ? WHERE SubmissionId = ?', [status, id]);
  } catch (err) {
    console.error('Error updating submission status:', err);
  }
  const back = filter ? `/admin/submissions?filter=${filter}` : '/admin/submissions';
  res.redirect(back);
}
