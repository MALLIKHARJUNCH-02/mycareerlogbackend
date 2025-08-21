require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Connect to MongoDB (replace YOUR_MONGO_URI with your connection string)
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define schema and model
const applicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  appliedDate: { type: Date, required: true },
  status: { type: String, required: true }
});

const Application = mongoose.model('Application', applicationSchema);

// Setup Express app
const app = express();
app.use(cors({
  origin: 'https://mycareerlogfrontend.vercel.app'
}));

app.use(bodyParser.json());

// Routes

// Get all applications
app.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({ appliedDate: 1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new application
app.post('/applications', async (req, res) => {
  const { company, appliedDate, status } = req.body;
  if (!company || !appliedDate || !status) {
    return res.status(400).json({ message: "Company, appliedDate and status are required" });
  }
  try {
    const application = new Application({ company, appliedDate, status });
    const saved = await application.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete application by ID
app.delete('/applications/:id', async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update application status by ID
app.put('/applications/:id', async (req, res) => {
  try {
    const appToUpdate = await Application.findById(req.params.id);
    if (!appToUpdate) {
      return res.status(404).json({ message: "Application not found" });
    }
    const { company, appliedDate, status } = req.body;
    if (company) appToUpdate.company = company;
    if (appliedDate) appToUpdate.appliedDate = appliedDate;
    if (status) appToUpdate.status = status;

    const updatedApp = await appToUpdate.save();
    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
