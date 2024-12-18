const express = require('express');
const router = express.Router();
const Module = require('../models/Module');

// GET /api/module/:moduleId - Fetch module details
router.get('/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }
    res.status(200).json({ module });
  } catch (error) {
    console.error("Failed to fetch module details", error);
    res.status(500).json({ error: "Failed to fetch module details" });
  }
});

// PUT /api/module/:moduleId - Update module questions
router.put('/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { questions } = req.body; // Expecting updated questions array
    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // Update questions
    module.questions = questions;
    await module.save();

    res.status(200).json({ message: "Module updated successfully." });
  } catch (error) {
    console.error("Failed to update module", error);
    res.status(500).json({ error: "Failed to update module" });
  }
});

module.exports = router;
