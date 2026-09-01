import { Router } from 'express';
import { createOrganization } from '../controllers/organization.controller';
import { authMiddleware } from '../utils/middleware';

const router = Router();

router.post('/createOrg', authMiddleware, createOrganization);

export default router;

