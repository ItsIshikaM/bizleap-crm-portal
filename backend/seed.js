const mongoose = require('mongoose');
require('dotenv').config();
const Lead = require('./models/Lead');

const sampleLeads = [
  {
    fullName: 'Jane Doe',
    companyName: 'Northstar Cloud',
    email: 'jane.doe@northstarcloud.io',
    countryCode: '+1',
    phone: '415 890 2341',
    industry: 'SaaS / IT',
    location: 'San Francisco, USA',
    leadSource: 'Website',
    leadStatus: 'New',
    followUpDate: new Date('2026-11-27'),
    followUpCompleted: false,
    notes: 'Requested enterprise API demo via landing page',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Rohan Kulkarni',
    companyName: 'FinBridge Technologies',
    email: 'rohan.k@finbridgetech.in',
    countryCode: '+91',
    phone: '98230 45120',
    industry: 'FinTech',
    location: 'Pune, India',
    leadSource: 'LinkedIn',
    leadStatus: 'Contacted',
    followUpDate: new Date('2026-11-26'),
    followUpCompleted: false,
    notes: 'Initial discovery call done; send security compliance doc',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Ananya Deshpande',
    companyName: 'CartPulse Retail',
    email: 'ananya@cartpulse.co.in',
    countryCode: '+91',
    phone: '97654 88210',
    industry: 'E-Commerce',
    location: 'Bengaluru, India',
    leadSource: 'Referral',
    leadStatus: 'Interested',
    followUpDate: new Date('2026-11-28'),
    followUpCompleted: false,
    notes: 'Reviewing annual tier pricing with CTO',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Marcus Vance',
    companyName: 'MedCore Diagnostics',
    email: 'm.vance@medcorediag.com',
    countryCode: '+44',
    phone: '20 7946 0821',
    industry: 'Healthcare',
    location: 'London, UK',
    leadSource: 'Website',
    leadStatus: 'Converted',
    followUpDate: null,
    followUpCompleted: true,
    notes: 'Signed 12-month onboarding contract',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Kavita Menon',
    companyName: 'Studio Pixelworks',
    email: 'kavita@studiopixelworks.in',
    countryCode: '+91',
    phone: '98450 33190',
    industry: 'Marketing / Agency',
    location: 'Mumbai, India',
    leadSource: 'LinkedIn',
    leadStatus: 'New',
    followUpDate: new Date('2026-11-29'),
    followUpCompleted: false,
    notes: 'Inbound inquiry for multi-client reporting',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Devansh Verma',
    companyName: 'Apex Steel & Forge',
    email: 'd.verma@apexforge.in',
    countryCode: '+91',
    phone: '99220 71455',
    industry: 'Manufacturing',
    location: 'Nagpur, India',
    leadSource: 'Cold Call',
    leadStatus: 'Contacted',
    followUpDate: new Date('2026-11-27'),
    followUpCompleted: false,
    notes: 'Follow up with operations head on ERP integration',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Elena Rostova',
    companyName: 'DataWeave Analytics',
    email: 'elena@dataweave.ai',
    countryCode: '+49',
    phone: '30 5551 9820',
    industry: 'SaaS / IT',
    location: 'Berlin, Germany',
    leadSource: 'Referral',
    leadStatus: 'Converted',
    followUpDate: null,
    followUpCompleted: true,
    notes: 'Closed Q4 analytics platform deal',
    createdDate: new Date('2026-11-25'),
  },
  {
    fullName: 'Siddharth Nair',
    companyName: 'UrbanNest Logistics',
    email: 's.nair@urbannestlog.in',
    countryCode: '+91',
    phone: '98111 60942',
    industry: 'Other',
    location: 'Hyderabad, India',
    leadSource: 'Cold Call',
    leadStatus: 'Lost',
    followUpDate: null,
    followUpCompleted: false,
    notes: 'Budget frozen until next fiscal quarter',
    createdDate: new Date('2026-11-25'),
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Lead.deleteMany({});
    await Lead.insertMany(sampleLeads);
    console.log('Successfully seeded 8 leads with separate country codes!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();