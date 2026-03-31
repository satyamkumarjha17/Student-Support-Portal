const Complaint = require('../models/Complaint');

// Get all complaints for a user or department
exports.getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.type === 'Student') {
      query.studentId = req.user.id;
    } else {
      // Management sees complaints for their department
      query.department = req.user.department;
    }

    const complaints = await Complaint.find(query)
      .populate('studentId', 'name uid email studentType hostelName roomNumber')
      .sort('-createdAt');
      
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, department } = req.body;
    
    const newComplaint = new Complaint({
      title,
      description,
      category,
      department,
      studentId: req.user.id
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a specific complaint
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId', 'name uid email studentType hostelName roomNumber');
      
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Auth check: Is this student's complaint, or is the user in the right dept?
    if (req.user.type === 'Student' && complaint.studentId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (req.user.type === 'Management' && complaint.department !== req.user.department) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.type !== 'Management') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized for this department' });
    }

    complaint.status = status;
    await complaint.save();
    
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
