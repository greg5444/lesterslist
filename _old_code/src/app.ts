import express from 'express';
import { json, urlencoded } from 'body-parser';
import { setApiRoutes } from './routes/api';
import { setWebRoutes } from './routes/web';

const app = express();

// Middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.set('view engine', 'pug');
app.set('views', './src/views');
app.use(express.static('src/public'));

// Routes
setApiRoutes(app);
setWebRoutes(app);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

export default app;