const env = require('../config/env');
const mongoose = require('mongoose');

const User = require('../models/User');
const Device = require('../models/Device');
const Brand = require('../models/Brand');
const DeviceModel = require('../models/Model');
const RepairService = require('../models/RepairService');
const Location = require('../models/Location');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const ContactRequest = require('../models/ContactRequest');

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ---------------------------------------------------------------------------
// Static demo data definitions
// ---------------------------------------------------------------------------

const DEVICES = [
  { name: 'iPhone', icon: 'smartphone', description: 'Screen, battery and hardware repairs for every iPhone.' },
  { name: 'iPad', icon: 'tablet', description: 'Repairs for iPad Pro, Air, Mini and standard iPad models.' },
  { name: 'MacBook', icon: 'laptop', description: 'Screen, battery, keyboard and logic board repairs for MacBooks.' },
  { name: 'Samsung', icon: 'smartphone', description: 'Repairs for the full Samsung Galaxy phone lineup.' },
  { name: 'Google Pixel', icon: 'smartphone', description: 'Fast, reliable repairs for every Pixel phone.' },
  { name: 'Laptop', icon: 'laptop', description: 'Windows laptop repairs across all major brands.' },
  { name: 'Tablet', icon: 'tablet', description: 'Android and Windows tablet repairs.' },
  { name: 'Smartwatch', icon: 'watch', description: 'Screen and battery repairs for smartwatches.' },
  { name: 'Game Console', icon: 'gamepad-2', description: 'Repairs for PlayStation, Xbox and Nintendo consoles.' },
  { name: 'Other Devices', icon: 'cpu', description: "Bring in anything else — we'll take a look." },
];

// brand name -> which device(s) it belongs to
const BRANDS_BY_DEVICE = {
  iPhone: ['Apple'],
  iPad: ['Apple'],
  MacBook: ['Apple'],
  Samsung: ['Samsung'],
  'Google Pixel': ['Google'],
  Laptop: ['Dell', 'HP', 'Lenovo'],
  Tablet: ['Samsung', 'Lenovo'],
  Smartwatch: ['Apple', 'Samsung'],
  'Game Console': ['Sony', 'Microsoft', 'Nintendo'],
  'Other Devices': ['Other'],
};

// device name -> [{ brand, models: [{name, year}] }]
const MODELS_BY_DEVICE = {
  iPhone: {
    Apple: [
      { name: 'iPhone 15 Pro Max', year: 2023 },
      { name: 'iPhone 15', year: 2023 },
      { name: 'iPhone 14 Pro', year: 2022 },
      { name: 'iPhone 14', year: 2022 },
      { name: 'iPhone 13', year: 2021 },
      { name: 'iPhone SE (2022)', year: 2022 },
    ],
  },
  iPad: {
    Apple: [
      { name: 'iPad Pro 12.9" (2022)', year: 2022 },
      { name: 'iPad Air (5th Gen)', year: 2022 },
      { name: 'iPad (10th Gen)', year: 2022 },
    ],
  },
  MacBook: {
    Apple: [
      { name: 'MacBook Pro 14" M3', year: 2023 },
      { name: 'MacBook Air 13" M2', year: 2022 },
      { name: 'MacBook Pro 16" M2', year: 2023 },
      { name: 'MacBook Air M1', year: 2020 },
    ],
  },
  Samsung: {
    Samsung: [
      { name: 'Galaxy S24 Ultra', year: 2024 },
      { name: 'Galaxy S23', year: 2023 },
      { name: 'Galaxy A54', year: 2023 },
    ],
  },
  'Google Pixel': {
    Google: [
      { name: 'Pixel 8 Pro', year: 2023 },
      { name: 'Pixel 8', year: 2023 },
      { name: 'Pixel 7a', year: 2023 },
    ],
  },
  Laptop: {
    Dell: [{ name: 'Dell XPS 13', year: 2023 }],
    HP: [{ name: 'HP Spectre x360', year: 2022 }],
    Lenovo: [{ name: 'Lenovo ThinkPad X1 Carbon', year: 2023 }],
  },
  Tablet: {
    Samsung: [{ name: 'Galaxy Tab S9', year: 2023 }],
    Lenovo: [{ name: 'Lenovo Tab P11', year: 2022 }],
  },
  Smartwatch: {
    Apple: [
      { name: 'Apple Watch Series 9', year: 2023 },
      { name: 'Apple Watch SE', year: 2022 },
    ],
    Samsung: [{ name: 'Galaxy Watch 6', year: 2023 }],
  },
  'Game Console': {
    Sony: [{ name: 'PlayStation 5', year: 2020 }],
    Microsoft: [{ name: 'Xbox Series X', year: 2020 }],
    Nintendo: [{ name: 'Nintendo Switch OLED', year: 2021 }],
  },
  'Other Devices': {
    Other: [{ name: 'Generic / Other Device', year: 2023 }],
  },
};

// Repair categories applicable to each device type, with base price (INR) and minutes
const REPAIR_MATRIX = {
  iPhone: [
    ['Screen Replacement', 4999, 60],
    ['Battery Replacement', 2499, 45],
    ['Charging Port', 1999, 40],
    ['Camera Repair', 3499, 50],
    ['Speaker/Microphone', 1799, 35],
    ['Water Damage', 2999, 90],
    ['Back Glass', 2799, 55],
  ],
  iPad: [
    ['Screen Replacement', 6499, 75],
    ['Battery Replacement', 3499, 60],
    ['Charging Port', 2299, 45],
    ['Speaker/Microphone', 1999, 40],
    ['Software Issues', 999, 30],
  ],
  MacBook: [
    ['Screen Replacement', 12999, 90],
    ['Battery Replacement', 5999, 60],
    ['Charging Port', 3499, 45],
    ['Speaker/Microphone', 2999, 45],
    ['Software Issues', 1499, 40],
    ['Other Repairs', 2499, 60],
  ],
  Samsung: [
    ['Screen Replacement', 4499, 60],
    ['Battery Replacement', 2199, 45],
    ['Charging Port', 1799, 40],
    ['Camera Repair', 3199, 50],
    ['Back Glass', 2499, 55],
    ['Water Damage', 2799, 90],
  ],
  'Google Pixel': [
    ['Screen Replacement', 4299, 60],
    ['Battery Replacement', 2099, 45],
    ['Charging Port', 1699, 40],
    ['Camera Repair', 2999, 50],
    ['Back Glass', 2299, 55],
  ],
  Laptop: [
    ['Screen Replacement', 9999, 90],
    ['Battery Replacement', 4999, 60],
    ['Charging Port', 2999, 45],
    ['Software Issues', 1299, 40],
    ['Other Repairs', 2199, 60],
  ],
  Tablet: [
    ['Screen Replacement', 5499, 70],
    ['Battery Replacement', 2999, 55],
    ['Charging Port', 1999, 40],
    ['Software Issues', 999, 30],
  ],
  Smartwatch: [
    ['Screen Replacement', 2999, 40],
    ['Battery Replacement', 1799, 35],
    ['Charging Port', 1299, 25],
    ['Water Damage', 1999, 45],
  ],
  'Game Console': [
    ['Charging Port', 1499, 40],
    ['Speaker/Microphone', 1299, 30],
    ['Software Issues', 999, 35],
    ['Other Repairs', 1799, 50],
  ],
  'Other Devices': [
    ['Screen Replacement', 3499, 60],
    ['Battery Replacement', 1999, 45],
    ['Software Issues', 999, 30],
    ['Other Repairs', 1499, 40],
  ],
};

const LOCATIONS = [
  {
    name: 'FixHub Chandigarh',
    city: 'Chandigarh',
    state: 'Chandigarh',
    address: 'SCO 145, Sector 17-C',
    postalCode: '160017',
    phone: '+91 172 400 1234',
    email: 'chandigarh@fixhubrepairs.com',
    latitude: 30.7409,
    longitude: 76.7828,
    hours: [
      { day: 'Mon - Sat', hours: '10:00 AM - 8:00 PM' },
      { day: 'Sunday', hours: '11:00 AM - 5:00 PM' },
    ],
  },
  {
    name: 'FixHub New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    address: '14 Connaught Place',
    postalCode: '110001',
    phone: '+91 11 4300 5678',
    email: 'delhi@fixhubrepairs.com',
    latitude: 28.6315,
    longitude: 77.2167,
    hours: [
      { day: 'Mon - Sat', hours: '10:00 AM - 8:30 PM' },
      { day: 'Sunday', hours: '11:00 AM - 6:00 PM' },
    ],
  },
  {
    name: 'FixHub Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '221 Linking Road, Bandra West',
    postalCode: '400050',
    phone: '+91 22 6700 9012',
    email: 'mumbai@fixhubrepairs.com',
    latitude: 19.0596,
    longitude: 72.8295,
    hours: [
      { day: 'Mon - Sat', hours: '10:00 AM - 9:00 PM' },
      { day: 'Sunday', hours: '11:00 AM - 6:00 PM' },
    ],
  },
  {
    name: 'FixHub Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '58 100 Feet Road, Indiranagar',
    postalCode: '560038',
    phone: '+91 80 4900 3456',
    email: 'bengaluru@fixhubrepairs.com',
    latitude: 12.9716,
    longitude: 77.6412,
    hours: [
      { day: 'Mon - Sat', hours: '10:00 AM - 8:30 PM' },
      { day: 'Sunday', hours: '11:00 AM - 5:30 PM' },
    ],
  },
  {
    name: 'FixHub Pune',
    city: 'Pune',
    state: 'Maharashtra',
    address: '9 FC Road, Shivajinagar',
    postalCode: '411005',
    phone: '+91 20 6600 7890',
    email: 'pune@fixhubrepairs.com',
    latitude: 18.5246,
    longitude: 73.8479,
    hours: [
      { day: 'Mon - Sat', hours: '10:00 AM - 8:00 PM' },
      { day: 'Sunday', hours: '11:00 AM - 5:00 PM' },
    ],
  },
];

const CUSTOMER_NAMES = [
  'Aarav Sharma', 'Priya Nair', 'Rohan Mehta', 'Ananya Iyer', 'Vikram Singh',
  'Sneha Kapoor', 'Karan Malhotra', 'Ishita Rao', 'Aditya Verma', 'Neha Joshi',
];

const REVIEW_COMMENTS = [
  'Screen looks brand new and it was ready faster than they estimated.',
  'Battery life is back to normal. Straightforward drop-off and pickup.',
  'Explained the issue clearly before starting any work. Fair pricing.',
  'Charging port repair fixed the loose connection I had for months.',
  'Really appreciated the six month warranty on the parts.',
  'Booked online in a couple of minutes and got a text when it was ready.',
  'Camera repair was clean, no dust under the lens afterward.',
  'Staff walked me through the diagnosis before quoting a price.',
  'Water damage recovery worked — thought the phone was gone for good.',
  'Console HDMI port fixed same day, back to gaming that evening.',
  'Good communication throughout, no surprise charges at pickup.',
  'Laptop keyboard replacement was quick and keys feel great.',
  'Friendly technicians, comfortable waiting area at the store.',
  'Back glass replacement matched the original color perfectly.',
  'Software issue turned out to be minor, they did not overcharge me for it.',
  'Second time using FixHub, consistent quality both times.',
];

async function run() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding.');

  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Device.deleteMany({}),
    Brand.deleteMany({}),
    DeviceModel.deleteMany({}),
    RepairService.deleteMany({}),
    Location.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    ContactRequest.deleteMany({}),
  ]);

  // --- Devices ---------------------------------------------------------
  const deviceDocs = {};
  for (let i = 0; i < DEVICES.length; i++) {
    const d = DEVICES[i];
    const doc = await Device.create({
      name: d.name,
      slug: slugify(d.name),
      icon: d.icon,
      description: d.description,
      sortOrder: i,
    });
    deviceDocs[d.name] = doc;
  }
  console.log(`Created ${DEVICES.length} devices.`);

  // --- Brands ------------------------------------------------------------
  const brandDocs = {}; // key: `${deviceName}::${brandName}`
  let brandCount = 0;
  for (const [deviceName, brandNames] of Object.entries(BRANDS_BY_DEVICE)) {
    for (const brandName of brandNames) {
      const slug = slugify(`${brandName}-${deviceName}`);
      const doc = await Brand.create({
        name: brandName,
        slug,
        device: deviceDocs[deviceName]._id,
      });
      brandDocs[`${deviceName}::${brandName}`] = doc;
      brandCount++;
    }
  }
  console.log(`Created ${brandCount} brands.`);

  // --- Models --------------------------------------------------------------
  const modelDocs = []; // { doc, deviceName }
  for (const [deviceName, byBrand] of Object.entries(MODELS_BY_DEVICE)) {
    for (const [brandName, models] of Object.entries(byBrand)) {
      const brand = brandDocs[`${deviceName}::${brandName}`];
      for (const m of models) {
        const doc = await DeviceModel.create({
          name: m.name,
          slug: slugify(m.name),
          brand: brand._id,
          device: deviceDocs[deviceName]._id,
          releaseYear: m.year,
        });
        modelDocs.push({ doc, deviceName, brand });
      }
    }
  }
  console.log(`Created ${modelDocs.length} device models.`);

  // --- Repair services -----------------------------------------------------
  const repairDocs = [];
  for (const { doc: model, deviceName, brand } of modelDocs) {
    const categories = REPAIR_MATRIX[deviceName] || [];
    for (const [category, basePrice, minutes] of categories) {
      const repair = await RepairService.create({
        category,
        name: category,
        description: `${category} for ${model.name}, done by certified technicians using quality-tested parts.`,
        device: deviceDocs[deviceName]._id,
        brand: brand._id,
        model: model._id,
        price: basePrice,
        estimatedMinutes: minutes,
        warrantyMonths: category === 'Software Issues' ? 1 : 6,
      });
      repairDocs.push(repair);
    }
  }
  console.log(`Created ${repairDocs.length} repair services.`);

  // --- Locations -------------------------------------------------------------
  const locationDocs = [];
  for (const loc of LOCATIONS) {
    const doc = await Location.create({
      name: loc.name,
      slug: slugify(loc.name),
      address: loc.address,
      city: loc.city,
      state: loc.state,
      postalCode: loc.postalCode,
      phone: loc.phone,
      email: loc.email,
      latitude: loc.latitude,
      longitude: loc.longitude,
      openingHours: loc.hours,
      services: ['Screen Repair', 'Battery Replacement', 'Water Damage', 'Software Diagnostics'],
    });
    locationDocs.push(doc);
  }
  console.log(`Created ${locationDocs.length} locations.`);

  // --- Admin user --------------------------------------------------------
  await User.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: 'admin',
    phone: '+91 90000 00000',
  });
  console.log('Created admin account.');

  // --- Customers -----------------------------------------------------------
  const customers = [];
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const name = CUSTOMER_NAMES[i];
    const email = `${slugify(name)}@example.com`;
    const doc = await User.create({
      name,
      email,
      password: 'Customer@123',
      phone: `+91 98${String(100000000 + i * 111).slice(0, 8)}`,
      address: `${100 + i} Demo Street, ${LOCATIONS[i % LOCATIONS.length].city}`,
      role: 'customer',
    });
    customers.push(doc);
  }
  console.log(`Created ${customers.length} customer accounts (password: Customer@123).`);

  // --- Bookings --------------------------------------------------------------
  const statuses = ['Pending', 'Confirmed', 'In Repair', 'Ready for Pickup', 'Completed', 'Completed', 'Cancelled'];
  const bookingDocs = [];
  const totalBookings = 24;
  for (let i = 0; i < totalBookings; i++) {
    const repair = repairDocs[Math.floor(Math.random() * repairDocs.length)];
    const location = locationDocs[i % locationDocs.length];
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const daysOffset = totalBookings - i; // spread creation dates over past weeks
    const preferredDate = new Date();
    preferredDate.setDate(preferredDate.getDate() - daysOffset + 5);

    const booking = await Booking.create({
      customer: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      device: repair.device,
      brand: repair.brand,
      model: repair.model,
      repairService: repair._id,
      location: location._id,
      price: repair.price,
      estimatedMinutes: repair.estimatedMinutes,
      warrantyMonths: repair.warrantyMonths,
      preferredDate,
      preferredTime: ['9:30 AM', '11:00 AM', '1:30 PM', '3:00 PM', '5:30 PM'][i % 5],
      status,
      notes: i % 4 === 0 ? 'Please call before starting any work.' : '',
    });

    // backdate createdAt so "bookings over time" charts have spread data
    booking.createdAt = new Date(Date.now() - daysOffset * 24 * 60 * 60 * 1000);
    await booking.save();

    bookingDocs.push(booking);
  }
  console.log(`Created ${bookingDocs.length} bookings.`);

  // --- Reviews ---------------------------------------------------------------
  const completedBookings = bookingDocs.filter((b) => b.status === 'Completed');
  let reviewCount = 0;
  for (let i = 0; i < REVIEW_COMMENTS.length; i++) {
    const booking = completedBookings[i % completedBookings.length] || bookingDocs[i % bookingDocs.length];
    const customer = customers.find((c) => c._id.equals(booking.customer)) || customers[i % customers.length];
    const repair = repairDocs.find((r) => r._id.equals(booking.repairService));
    const device = deviceDocs[Object.keys(deviceDocs)[i % Object.keys(deviceDocs).length]];

    await Review.create({
      customer: customer._id,
      customerName: customer.name,
      booking: booking._id,
      deviceRepaired: device.name,
      rating: [5, 5, 5, 4, 5, 4, 5, 3, 5, 4][i % 10],
      comment: REVIEW_COMMENTS[i],
      status: 'Approved',
    });
    reviewCount++;
  }
  console.log(`Created ${reviewCount} reviews.`);

  // --- A couple of sample contact requests -----------------------------------
  await ContactRequest.create([
    {
      name: 'Meera Pillai',
      email: 'meera.pillai@example.com',
      phone: '+91 98765 43210',
      subject: 'Question about laptop warranty',
      message: 'Does the 6 month warranty cover accidental drops after the repair?',
      status: 'New',
    },
    {
      name: 'Farhan Ali',
      email: 'farhan.ali@example.com',
      subject: 'Bulk repair enquiry for office',
      message: 'We have 12 laptops that need battery replacements. Can you do a bulk quote?',
      status: 'In Progress',
    },
  ]);

  console.log('\nSeed complete!');
  console.log('----------------------------------------');
  console.log(`Admin login: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  console.log('Sample customer login: aarav-sharma@example.com / Customer@123');
  console.log('----------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
