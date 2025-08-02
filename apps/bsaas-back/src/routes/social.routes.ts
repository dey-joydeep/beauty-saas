import { Router } from 'express';
import { googleLogin, facebookLogin } from '../modules/social/social.controller';

const router = Router();

router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);

export default router;
