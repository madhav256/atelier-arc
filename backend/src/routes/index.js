import { Router } from 'express';
import auth from './auth.js';
import catalog from './catalog.js';
import me from './me.js';
import commerce from './commerce.js';
import admin from './admin.js';

const r = Router();
r.use('/auth', auth);
r.use('/me', me);
r.use('/admin', admin);
r.use('/', catalog);
r.use('/', commerce);
export default r;
