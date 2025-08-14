const { Router } = require('express');
const detailModel = require('../models/importantInfo');
const router = Router();
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/docImages`));
  },
  filename: function (req, file, cb) {
    const date = Date.now();
    const filename = `${date}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Helper to send verification email
async function sendVerificationEmail(email, status, comment) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  let subject, text;
  if (status === 'approved') {
    subject = 'Your Car Rental Documents are Approved';
    text = 'Congratulations! Your documents have been approved. You can now pick a car.';
  } else {
    subject = 'Your Car Rental Documents are Rejected';
    text = 'Sorry, your documents were not approved.';
  }
  if (comment) text += `\nAdmin comment: ${comment}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    text
  });
}

router.post('/send', upload.fields([
  { name: 'adharCard', maxCount: 1 },
  { name: 'drivingLicence', maxCount: 1 }
]), async (req, res) => {
  try {
    const adharCard = req.files['adharCard']?.[0];
    const drivingLicence = req.files['drivingLicence']?.[0];
    const { firstName, lastName, phNumber, email, startDate, endDate, carId } = req.body;

    if (!firstName || !lastName || !phNumber || !email || !adharCard || !drivingLicence || !startDate || !endDate || !carId) {
      return res.status(404).send({
        message: 'All fields and documents are required.'
      });
    }

    const details = await detailModel.create({
      firstName,
      lastName,
      phNumber,
      email,
      adharCard: adharCard.filename,
      drivingLicence: drivingLicence.filename,
      startDate,
      endDate,
      carId
    });

    return res.status(200).send({
      message: 'Details created successfully',
      details
    });

  } catch (error) {
    return res.status(500).send({
      message: 'Server error',
      error
    });
  }
});

router.get('/detail', async (req, res) => {
  try {
    const allDetails = await detailModel.find();
    if (!allDetails.length) {
      return res.status(404).send({
        message: 'Data not found'
      });
    }
    return res.status(200).send({
      message: 'Successfully fetched data',
      detail: allDetails
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Server error',
      error
    });
  }
});

// Get all pending verifications
router.get('/pending', async (req, res) => {
  try {
    const pendingDetails = await detailModel.find({ verificationStatus: 'pending' });
    return res.status(200).send({
      message: 'Pending verifications fetched successfully',
      detail: pendingDetails
    });
  } catch (error) {
    return res.status(500).send({
      message: 'Server error',
      error
    });
  }
});

// Approve a verification
router.patch('/approve/:id', async (req, res) => {
  try {
    const { adminComment } = req.body;
    const updated = await detailModel.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'approved', adminComment: adminComment || '' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).send({ message: 'Verification not found' });
    }
    // Send approval email
    await sendVerificationEmail(updated.email, 'approved', adminComment);
    return res.status(200).send({ message: 'Verification approved', detail: updated });
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error });
  }
});

// Reject a verification
router.patch('/reject/:id', async (req, res) => {
  try {
    const { adminComment } = req.body;
    const updated = await detailModel.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: 'rejected', adminComment: adminComment || '' },
      { new: true }
    );
    if (!updated) {
      return res.status(404).send({ message: 'Verification not found' });
    }
    // Send rejection email
    await sendVerificationEmail(updated.email, 'rejected', adminComment);
    return res.status(200).send({ message: 'Verification rejected', detail: updated });
  } catch (error) {
    return res.status(500).send({ message: 'Server error', error });
  }
});

// Delete a request and its associated files
router.delete('/:id', async (req, res) => {
  try {
    const request = await detailModel.findById(req.params.id);
    if (!request) {
      return res.status(404).send({ message: 'Request not found' });
    }

    // Delete associated files
    try {
      if (request.adharCard) {
        await fs.unlink(path.join(__dirname, '../public/docImages', request.adharCard));
      }
      if (request.drivingLicence) {
        await fs.unlink(path.join(__dirname, '../public/docImages', request.drivingLicence));
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // Continue with request deletion even if file deletion fails
    }

    // Delete the request
    await detailModel.findByIdAndDelete(req.params.id);
    
    return res.status(200).send({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    return res.status(500).send({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
