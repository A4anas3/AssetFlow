require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');
const Department = require('./models/Department.model');
const Category = require('./models/Category.model');
const Employee = require('./models/Employee.model');
const Asset = require('./models/Asset.model');
const Allocation = require('./models/Allocation.model');
const Booking = require('./models/Booking.model');
const Maintenance = require('./models/Maintenance.model');
const Transfer = require('./models/Transfer.model');
const Audit = require('./models/Audit.model');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  // Clear existing collection data to prevent duplicates & conflicts
  console.log("Clearing existing collections...");
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Category.deleteMany({}),
    Employee.deleteMany({}),
    Asset.deleteMany({}),
    Allocation.deleteMany({}),
    Booking.deleteMany({}),
    Maintenance.deleteMany({}),
    Transfer.deleteMany({}),
    Audit.deleteMany({})
  ]);

  // 1. Create Users
  console.log("Seeding Users...");
  const admin = await User.create({
    name: 'System Admin',
    email: 'admin@assetflow.com',
    password: 'adminpassword',
    role: 'admin'
  });

  const sarah = await User.create({
    name: 'Sarah Connor',
    email: 'sarah@assetflow.com',
    password: 'password123',
    role: 'asset_manager'
  });

  const raj = await User.create({
    name: 'Raj Patel',
    email: 'raj@assetflow.com',
    password: 'password123',
    role: 'department_head'
  });

  const priya = await User.create({
    name: 'Priya Sharma',
    email: 'priya@assetflow.com',
    password: 'password123',
    role: 'employee'
  });

  const anas = await User.create({
    name: 'Anas Khan',
    email: 'anas@assetflow.com',
    password: 'password123',
    role: 'employee'
  });

  // 2. Create Departments
  console.log("Seeding Departments...");
  const deptIT = await Department.create({ name: 'IT Department', code: 'IT', head: raj._id });
  const deptHR = await Department.create({ name: 'Human Resources', code: 'HR', head: priya._id });
  const deptEng = await Department.create({ name: 'Engineering', code: 'ENG', parentDepartment: deptIT._id });

  // 3. Create Categories
  console.log("Seeding Categories...");
  const catLaptops = await Category.create({
    name: 'Laptops',
    description: 'Developer macbooks and ultrabooks',
    depreciationRate: 20,
    defaultWarrantyMonths: 24,
    customFields: [
      { key: 'RAM', value: '16GB' },
      { key: 'Storage', value: '512GB SSD' },
      { key: 'Processor', value: 'Apple M3' }
    ]
  });

  const catChairs = await Category.create({
    name: 'Office Furniture',
    description: 'Ergonomic desk chairs and tables',
    depreciationRate: 10,
    defaultWarrantyMonths: 12,
    customFields: [
      { key: 'Ergonomic', value: 'Yes' },
      { key: 'Material', value: 'Premium Mesh' }
    ]
  });

  const catRooms = await Category.create({
    name: 'Conference Rooms',
    description: 'Shared meeting and collaboration rooms',
    depreciationRate: 0,
    customFields: [
      { key: 'Capacity', value: '12 People' },
      { key: 'Projector', value: 'Yes' }
    ]
  });

  // 4. Create Employee Profiles
  console.log("Seeding Employee Profiles...");
  const empSarah = await Employee.create({
    employeeId: 'EMP-0001',
    user: sarah._id,
    department: deptIT._id,
    designation: 'Inventory Manager',
    role: 'asset_manager',
    status: 'active'
  });

  const empRaj = await Employee.create({
    employeeId: 'EMP-0002',
    user: raj._id,
    department: deptIT._id,
    designation: 'IT Director',
    role: 'department_head',
    status: 'active'
  });

  const empPriya = await Employee.create({
    employeeId: 'EMP-0003',
    user: priya._id,
    department: deptHR._id,
    designation: 'HR Lead',
    role: 'employee',
    status: 'active'
  });

  const empAnas = await Employee.create({
    employeeId: 'EMP-0004',
    user: anas._id,
    department: deptEng._id,
    designation: 'Software Developer',
    role: 'employee',
    status: 'active'
  });

  // 5. Create Assets
  console.log("Seeding Assets...");
  const assetMacbook = await Asset.create({
    name: 'Macbook Pro M3 Max',
    assetTag: 'AF-0114',
    category: catLaptops._id,
    department: deptHR._id,
    assignedTo: empPriya._id,
    status: 'allocated',
    condition: 'good',
    serialNumber: 'C02YT123LMLD',
    acquisitionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    acquisitionCost: 2499,
    location: 'Room 302',
    isBookable: false,
    description: 'Priya high-performance corporate laptop'
  });

  const assetChair = await Asset.create({
    name: 'Ergonomic Mesh Chair',
    assetTag: 'AF-0220',
    category: catChairs._id,
    department: deptEng._id,
    assignedTo: empAnas._id,
    status: 'allocated',
    condition: 'good',
    serialNumber: 'SN-CHAIR-9922',
    acquisitionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    acquisitionCost: 349,
    location: 'Desk 12',
    isBookable: false,
    description: 'Comfortable mesh lumbar support chair'
  });

  const assetBoardroom = await Asset.create({
    name: 'Boardroom A',
    assetTag: 'AF-0901',
    category: catRooms._id,
    status: 'available',
    condition: 'good',
    isBookable: true,
    location: 'Floor 3, East Wing',
    description: 'Corporate Boardroom equipped with digital display and conference setup'
  });

  const assetMonitor = await Asset.create({
    name: 'Dell UltraSharp 27"',
    assetTag: 'AF-0116',
    category: catLaptops._id,
    department: deptEng._id,
    status: 'in_maintenance',
    condition: 'poor',
    serialNumber: 'DELL-MONITOR-0019',
    acquisitionCost: 299,
    location: 'IT Lab',
    isBookable: false,
    description: 'Backlight flickering issue'
  });

  // 6. Create Allocations
  console.log("Seeding Allocations...");
  // Priya's active allocation
  const allocPriya = await Allocation.create({
    asset: assetMacbook._id,
    employee: empPriya._id,
    allocatedBy: admin._id,
    allocatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    expectedReturnDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // due in 60 days
    status: 'active',
    notes: 'Standard HR checkout'
  });

  // Anas's OVERDUE allocation
  const allocAnasOverdue = await Allocation.create({
    asset: assetChair._id,
    employee: empAnas._id,
    allocatedBy: admin._id,
    allocatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    expectedReturnDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // overdue by 2 days!
    status: 'active',
    notes: 'Temporary desk allocation'
  });

  // 7. Create Resource Bookings
  console.log("Seeding Resource Bookings...");
  // Ongoing booking for today
  await Booking.create({
    resource: assetBoardroom._id,
    bookedBy: priya._id,
    startTime: new Date(Date.now() - 30 * 60 * 1000), // started 30 mins ago
    endTime: new Date(Date.now() + 60 * 60 * 1000),   // ends in 1 hour
    purpose: 'HR Board Interview',
    status: 'ongoing'
  });

  // Upcoming booking for tomorrow
  await Booking.create({
    resource: assetBoardroom._id,
    bookedBy: anas._id,
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000),   // tomorrow (2 hrs)
    purpose: 'Daily Engineering Standup',
    status: 'upcoming'
  });

  // 8. Create Maintenance Logs
  console.log("Seeding Maintenance Logs...");
  // Active/In-Progress ticket
  await Maintenance.create({
    asset: assetMonitor._id,
    requestedBy: priya._id,
    assignedTo: admin._id,
    title: 'Monitor Flickering Backlight',
    description: 'Backlight flickers continuously and goes black after 5 minutes of usage.',
    priority: 'high',
    status: 'in_progress',
    estimatedCost: 100,
    startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  });

  // Resolved ticket
  await Maintenance.create({
    asset: assetChair._id,
    requestedBy: anas._id,
    title: 'Loose armrest on mesh chair',
    description: 'The right side armrest is loose and keeps dropping.',
    priority: 'low',
    status: 'resolved',
    actualCost: 35,
    notes: 'Tightened right support hex bolts and verified stability.',
    resolvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  });

  // 9. Create Inter-Department Transfers
  console.log("Seeding Transfer Requests...");
  await Transfer.create({
    asset: assetMacbook._id,
    fromDepartment: deptHR._id,
    toDepartment: deptIT._id,
    toEmployee: empRaj._id,
    requestedBy: raj._id,
    status: 'pending',
    reason: 'Temporary transfer needed for Raj compiling high-performance developer assets.'
  });

  // 10. Create Audit Cycles
  console.log("Seeding Audit Cycles...");
  await Audit.create({
    title: 'Q3 IT Department Assets Verification',
    department: deptIT._id,
    location: 'Floor 3, East Wing',
    auditors: [sarah._id],
    createdBy: admin._id,
    status: 'in_progress',
    startDate: new Date(),
    scheduledDate: new Date(),
    assets: [
      { asset: assetChair._id, verified: false },
      { asset: assetMacbook._id, verified: false }
    ]
  });

  console.log("Seeding completed successfully!");
  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

run().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
