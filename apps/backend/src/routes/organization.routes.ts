import { Router } from 'express';
import { createOrganization, getOrganizations } from '../controllers/organization.controller';
import { authMiddleware } from '../utils/middleware';

const router = Router();

router.post('/createOrg', authMiddleware, createOrganization);
router.get(
  "/",
  authMiddleware,
  getOrganizations
);

export default router;

