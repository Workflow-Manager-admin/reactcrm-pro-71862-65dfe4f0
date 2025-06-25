const metricsService = require('../services/metrics');

class MetricsController {
  // PUBLIC_INTERFACE
  async taskMetrics(req, res) {
    try {
      const summary = await metricsService.getTaskMetrics(req.user.id);
      res.json({ status: 'ok', metrics: summary });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }

  async interactionMetrics(req, res) {
    try {
      const summary = await metricsService.getInteractionMetrics(req.user.id);
      res.json({ status: 'ok', metrics: summary });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
}

module.exports = new MetricsController();
