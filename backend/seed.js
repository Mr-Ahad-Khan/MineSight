const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Mine = require('./models/Mine');
const Compliance = require('./models/Compliance');
const Inspection = require('./models/Inspection');
const Contractor = require('./models/Contractor');
const Alert = require('./models/Alert');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Mine.deleteMany();
    await Compliance.deleteMany();
    await Inspection.deleteMany();
    await Contractor.deleteMany();
    await Alert.deleteMany();

    console.log('Data cleared...');

    // Create Users
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@cil.gov.in',
      password: 'admin123',
      role: 'admin',
      phone: '9999999999',
    });

    const corporate = await User.create({
      name: 'Corporate Manager',
      email: 'corporate@cil.gov.in',
      password: 'corp123',
      role: 'corporate',
      phone: '9888888888',
    });

    const regulator = await User.create({
      name: 'DGMS Officer',
      email: 'regulator@dgms.gov.in',
      password: 'reg123',
      role: 'regulator',
      phone: '9777777777',
    });

    // Create Mines
    const mine1 = await Mine.create({
      name: 'Jayant Open Cast Mine',
      code: 'NCL-JYT-01',
      subsidiary: 'Northern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.45, 24.12] },
      address: 'Jayant, Singrauli, Madhya Pradesh',
      status: 'active',
      complianceScore: 78,
      riskLevel: 'medium',
    });

    const mine2 = await Mine.create({
      name: 'Amlohri Project',
      code: 'NCL-AML-02',
      subsidiary: 'Northern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.52, 24.08] },
      address: 'Amlohri, Singrauli, Madhya Pradesh',
      status: 'active',
      complianceScore: 92,
      riskLevel: 'low',
    });

    const mine3 = await Mine.create({
      name: 'Kusmunda Open Cast',
      code: 'SECL-KUS-01',
      subsidiary: 'South Eastern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.68, 22.35] },
      address: 'Kusmunda, Korba, Chhattisgarh',
      status: 'active',
      complianceScore: 65,
      riskLevel: 'high',
    });

    const mine4 = await Mine.create({
      name: 'Nigahi Open Cast Mine',
      code: 'NCL-NIG-03',
      subsidiary: 'Northern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.59, 24.02] },
      address: 'Nigahi, Singrauli, Madhya Pradesh',
      status: 'active',
      complianceScore: 86,
      riskLevel: 'low',
    });

    const mine5 = await Mine.create({
      name: 'Dudhichua Open Cast Mine',
      code: 'NCL-DDC-04',
      subsidiary: 'Northern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.66, 24.14] },
      address: 'Dudhichua, Singrauli, Madhya Pradesh',
      status: 'active',
      complianceScore: 74,
      riskLevel: 'medium',
    });

    const mine6 = await Mine.create({
      name: 'Gevra Open Cast Mine',
      code: 'SECL-GEV-02',
      subsidiary: 'South Eastern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.56, 22.35] },
      address: 'Gevra, Korba, Chhattisgarh',
      status: 'active',
      complianceScore: 69,
      riskLevel: 'high',
    });

    const mine7 = await Mine.create({
      name: 'Dipka Open Cast Mine',
      code: 'SECL-DPK-03',
      subsidiary: 'South Eastern Coalfields Limited',
      location: { type: 'Point', coordinates: [82.52, 22.30] },
      address: 'Dipka, Korba, Chhattisgarh',
      status: 'active',
      complianceScore: 81,
      riskLevel: 'medium',
    });

    // Create Mine Officials
    const official1 = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@ncl.gov.in',
      password: 'mine123',
      role: 'mine_official',
      mineId: mine1._id,
      phone: '9876543210',
    });

    const official2 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@ncl.gov.in',
      password: 'mine123',
      role: 'mine_official',
      mineId: mine2._id,
      phone: '9876543211',
    });

    // Update mine managers
    mine1.managerId = official1._id;
    await mine1.save();
    mine2.managerId = official2._id;
    await mine2.save();

    // Create Compliances
    await Compliance.create([
      {
        mineId: mine1._id,
        category: 'safety',
        title: 'DGMS Safety Audit - Q3',
        description: 'Quarterly safety audit as per DGMS guidelines',
        statutoryReference: 'DGMS Circular 02/2023',
        frequency: 'quarterly',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'pending',
        responsiblePerson: official1._id,
      },
      {
        mineId: mine1._id,
        category: 'environment',
        title: 'Air Quality Monitoring Report',
        description: 'Monthly ambient air quality monitoring',
        statutoryReference: 'MoEFCC Notification',
        frequency: 'monthly',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: 'overdue',
        responsiblePerson: official1._id,
      },
      {
        mineId: mine2._id,
        category: 'labour',
        title: 'Contract Labour Compliance',
        description: 'CLRA Act compliance check',
        statutoryReference: 'CLRA Act 1970',
        frequency: 'monthly',
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'compliant',
        responsiblePerson: official2._id,
      },
      {
        mineId: mine3._id,
        category: 'production',
        title: 'Monthly Production Report',
        description: 'Submit production figures to CIL HQ',
        frequency: 'monthly',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ]);

    // Create Inspections
    await Inspection.create([
      {
        mineId: mine1._id,
        inspectorId: official1._id,
        type: 'safety',
        title: 'Haul Road Safety Inspection',
        description: 'Routine inspection of main haul road',
        location: { type: 'Point', coordinates: [82.451, 24.121] },
        observations: 'Some berms are damaged on the eastern side',
        status: 'open',
        severity: 'high',
        riskScore: 72,
        violations: [
          {
            description: 'Damaged safety berms on haul road',
            category: 'safety',
            severity: 'high',
            correctiveAction: 'Repair berms within 7 days',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'open',
          },
        ],
      },
      {
        mineId: mine3._id,
        inspectorId: official1._id,
        type: 'environment',
        title: 'Dust Suppression Check',
        description: 'Checking water sprinklers efficiency',
        location: { type: 'Point', coordinates: [82.682, 22.352] },
        observations: 'Sprinklers not working in sector B',
        status: 'in_progress',
        severity: 'critical',
        riskScore: 88,
        violations: [
          {
            description: 'Non-functional dust suppression system',
            category: 'environment',
            severity: 'critical',
            correctiveAction: 'Repair immediately',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            status: 'open',
          },
        ],
      },
      {
        mineId: mine2._id,
        inspectorId: official2._id,
        type: 'scheduled',
        title: 'PPE Compliance Check',
        description: 'Workers PPE verification',
        status: 'closed',
        severity: 'low',
        riskScore: 20,
        closedAt: new Date(),
        violations: [],
      },
    ]);

    // Create Contractors
    await Contractor.create([
      {
        name: 'Bharat Earth Movers Ltd',
        registrationNo: 'BEML-2022-045',
        contactPerson: 'Suresh Patel',
        phone: '9123456780',
        email: 'suresh@beml.in',
        mineIds: [mine1._id, mine2._id],
        contractStart: new Date('2023-01-01'),
        contractEnd: new Date('2026-12-31'),
        status: 'active',
        complianceScore: 85,
      },
      {
        name: 'Singrauli Transport Co.',
        registrationNo: 'STC-2021-112',
        contactPerson: 'Amit Verma',
        phone: '9123456781',
        email: 'amit@stc.in',
        mineIds: [mine1._id],
        contractStart: new Date('2022-06-01'),
        contractEnd: new Date('2025-05-31'),
        status: 'active',
        complianceScore: 70,
      },
    ]);

    // Create Alerts
    await Alert.create([
      {
        mineId: mine1._id,
        type: 'high_risk',
        title: 'High Risk Inspection Detected',
        message: 'Haul Road Safety Inspection has risk score 72. Immediate action required.',
        severity: 'warning',
        assignedTo: official1._id,
      },
      {
        mineId: mine3._id,
        type: 'violation',
        title: 'Critical Environment Violation',
        message: 'Dust suppression system non-functional in Kusmunda mine.',
        severity: 'critical',
        assignedTo: corporate._id,
      },
      {
        mineId: mine1._id,
        type: 'compliance_due',
        title: 'Overdue: Air Quality Report',
        message: 'Air Quality Monitoring Report is overdue by 5 days.',
        severity: 'warning',
        assignedTo: official1._id,
      },
    ]);

    console.log('Seed data created successfully!');
    console.log('\n=== Login Credentials ===');
    console.log('Admin      : admin@cil.gov.in / admin123');
    console.log('Corporate  : corporate@cil.gov.in / corp123');
    console.log('Regulator  : regulator@dgms.gov.in / reg123');
    console.log('Mine Off.1 : rajesh@ncl.gov.in / mine123');
    console.log('Mine Off.2 : priya@ncl.gov.in / mine123');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
