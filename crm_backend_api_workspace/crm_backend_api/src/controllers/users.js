const userService = require('../services/users');

class UsersController {
  // PUBLIC_INTERFACE
  async getMe(req, res) {
    const userId = req.user.id;
    try {
      const user = await userService.getUserById(userId);
      if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
      const { password, ...userInfo } = user;
      res.json({ status: 'ok', user: userInfo });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new UsersController();
