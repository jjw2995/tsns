const router = require('express').Router();
const { verifyAccessToken } = require('../../middlewares');

router.use('/auth', require('./route-auth'));

router.use(verifyAccessToken);
router.use('/followers', require('./route-follower'));
router.use('/posts', require('./route-post'));
router.use('/comments', require('./route-comment'));
// router.use('/', require('./'));
// router.use('/', require('./'));
// router.use('/', require('./'));

module.exports = router;
