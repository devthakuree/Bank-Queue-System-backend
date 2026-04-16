const Counter = require("../models/Counter");
const Service = require("../models/Service");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const defaultServices = [
  {
    name: "Cash Deposit / Withdrawal",
    code: "CDW",
    serviceType: "cash",
    priorityLevel: "high",
    averageServiceTime: 5,
  },
  {
    name: "Account Services",
    code: "ACC",
    serviceType: "account",
    priorityLevel: "medium",
    averageServiceTime: 7,
  },
  {
    name: "General Inquiry",
    code: "GEN",
    serviceType: "inquiry",
    priorityLevel: "low",
    averageServiceTime: 4,
  },
];

const defaultCounters = [
  {
    name: "Counter 1",
    counterNumber: 1,
    supportedPriorities: ["high", "medium", "low"],
  },
  {
    name: "Counter 2",
    counterNumber: 2,
    supportedPriorities: ["high", "medium", "low"],
  },
];

const seedServices = async () => {
  for (const service of defaultServices) {
    await Service.findOneAndUpdate({ code: service.code }, service, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
};

const seedCounters = async () => {
  for (const counter of defaultCounters) {
    await Counter.findOneAndUpdate({ counterNumber: counter.counterNumber }, counter, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
};

const seedAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = (process.env.ADMIN_PASSWORD || "").trim();

  if (!adminEmail || !adminPassword) {
    console.warn(
      "Admin seed skipped. Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env to create a default admin user."
    );
    return;
  }

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: "Default Admin",
    email: adminEmail,
    passwordHash,
    role: "admin",
  });

  console.log(`Seeded default admin user: ${adminEmail}`);
};

const seedInitialData = async () => {
  await seedServices();
  await seedCounters();
  await seedAdminUser();
};

module.exports = {
  seedInitialData,
};
