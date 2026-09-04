const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Mine = require('./models/Mine');
const Contractor = require('./models/Contractor');

dotenv.config();

const contractorDetails = {
  name: 'Shakti Infra & Mining Contractors Pvt. Ltd.',
  registrationNo: 'MP-SGR-2024-1187',
  contactPerson: 'Ananya Singh',
  phone: '9876543212',
  email: 'ananya@shakticontractors.in',
  contractStart: new Date('2024-04-01'),
  contractEnd: new Date('2027-03-31'),
  status: 'active',
  complianceScore: 88,
};

async function seedContractorDemo() {
  try {
    await connectDB();

    const primaryMine = await Mine.findOne({ code: 'NCL-JYT-01' });
    const secondaryMine = await Mine.findOne({ code: 'NCL-NIG-03' });
    const mineIds = [primaryMine?._id, secondaryMine?._id].filter(Boolean);

    let user = await User.findOne({ email: contractorDetails.email });
    if (!user) {
      user = await User.create({
        name: contractorDetails.contactPerson,
        email: contractorDetails.email,
        password: 'contract123',
        role: 'contractor',
        mineId: primaryMine?._id || null,
        phone: contractorDetails.phone,
      });
      console.log('Created contractor login.');
    } else {
      console.log('Contractor login already exists; left it unchanged.');
    }

    await Contractor.findOneAndUpdate(
      { registrationNo: contractorDetails.registrationNo },
      { ...contractorDetails, mineIds },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log('Contractor profile is ready.');
    console.log('Login: ananya@shakticontractors.in / contract123');
  } catch (error) {
    console.error('Could not add contractor demo:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

seedContractorDemo();
