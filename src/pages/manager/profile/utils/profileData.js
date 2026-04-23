export const initialManagerData = {
  avatar: null,
  personalInfo: {
    fullName: "John Manager",
    email: "john.manager@company.com",
    phone: "+94 77 123 4567",
    dob: "1985-06-15",
    gender: "Male",
    nationality: "Sri Lankan",
    address: {
      street: "123 Manager Street",
      city: "Colombo",
      state: "Western Province",
      postalCode: "00100"
    },
    emergencyContact: {
      name: "Sarah Manager",
      phone: "+94 76 987 6543"
    }
  },
  professionalInfo: {
    employeeId: "MGR-001",
    department: "Operations",
    designation: "Operations Manager",
    joiningDate: "2020-01-15",
    employmentType: "Full-time",
    workLocation: "Colombo Head Office",
    teamSize: 15,
    reportsTo: "Director of Operations",
    managerLevel: "Senior Manager"
  },
  managerSpecific: {
    teamsManaged: ["Sales Team", "Marketing Team", "Customer Support"],
    performanceMetrics: {
      teamProductivity: 92,
      employeeRetention: 95,
      projectCompletion: 88
    },
    accessLevel: "Level 3",
    budgetAuthority: "Up to $50,000",
    approvalLimits: {
      leave: true,
      expenses: true,
      recruitment: true,
      promotions: false
    }
  },
  bankDetails: {
    accountName: "John Manager",
    accountNumber: "1234567890",
    bankName: "Commercial Bank",
    branch: "Colombo City",
    accountType: "Savings",
    swiftCode: "CBCELKLX"
  },
  documents: [
    { id: 1, name: "Employment Contract", type: "PDF", uploaded: "2024-01-15" },
    { id: 2, name: "Manager Certification", type: "PDF", uploaded: "2024-02-20" },
    { id: 3, name: "NDA Agreement", type: "DOC", uploaded: "2024-01-20" }
  ],
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
    language: "English",
    timezone: "Asia/Colombo"
  }
};