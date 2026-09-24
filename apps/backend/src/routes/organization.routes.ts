import { Router } from 'express';
import { addOrganizationMember, createOrganization, getOrganizations } from '../controllers/organization.controller';
import { authMiddleware } from '../utils/middleware';

const router = Router();

router.post('/createOrg', authMiddleware, createOrganization);
router.post('/:organizationId/members', authMiddleware, addOrganizationMember);
router.get(
  "/",
  authMiddleware,
  getOrganizations
);

export default router;

