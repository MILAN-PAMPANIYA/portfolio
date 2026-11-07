export const person = {
  formalName: "Pampaniya Milan G.",
  name: "Milan Pampaniya",
  first: "Milan",
  last: "Pampaniya",
  role: "Aspiring Software Engineer",
  title: "IT Student",
  city: "Ahmedabad",
  region: "Gujarat",
  email: "milanpampaniyaaa@gmail.com",
  institute: "LJ Institute of Engineering",
  degree: "Bachelor of Technology (B.Tech) – Information Technology",
  semester: "3rd Semester",
  graduation: "2029",
  class12: "80%",
};

export const summary = {
  hello: "Hello, I'm",
  line1:
    "B.Tech Information Technology student at LJ Institute of Engineering, building practical software with Java and MySQL.",
  line2:
    "Hands-on with an online ticket booking system for bus, train, and flight reservations.",
  about: [
    "Motivated B.Tech Information Technology student with a strong interest in software development, web technologies, and database management. Currently pursuing the 3rd semester at LJ Institute of Engineering, with an expected graduation in 2029.",
    "Hands-on experience developing a Java-based Online Ticket Booking System using MySQL, JDBC, and XAMPP. I develop personal projects independently, practice problem-solving and debugging, and keep improving — Python is in progress. Class 12: 80%. College faculty appreciated the ticket booking system.",
  ],
};

export const heroStats = [
  { value: "80%", label: "Class 12" },
  { value: "3rd", label: "Semester, B.Tech IT" },
  { value: "2029", label: "Expected graduation" },
];

export const workStats = [
  { value: "3", label: "Booking modes", detail: "Bus, train, and flight" },
  { value: "2", label: "Login roles", detail: "Admin and User" },
  { value: "1", label: "Project", detail: "Faculty appreciated" },
];

export const project = {
  name: "Online Ticket Booking System",
  tech: ["Java", "MySQL", "JDBC", "XAMPP"],
  bullets: [
    "Developed a comprehensive ticket booking application supporting bus, train and flight reservations.",
    "Implemented separate Admin and User login and authentication.",
    "Integrated seat selection, payment processing and booking cancellation.",
    "Generated automated invoices, payment receipts and administrative reports.",
  ],
  note: "Received positive appreciation from college faculty for project development.",
};

export const tools = [
  "Java",
  "C",
  "Python · Learning",
  "HTML",
  "CSS",
  "MySQL",
  "JDBC",
  "XAMPP",
  "IntelliJ IDEA",
  "VS Code",
  "Object-Oriented Programming",
  "Database Management",
];

export const skillGroups = [
  {
    label: "Programming languages",
    items: ["Java", "C", "Python (Learning)"],
  },
  {
    label: "Web technologies",
    items: ["HTML", "CSS"],
  },
  {
    label: "Database",
    items: ["MySQL"],
  },
  {
    label: "Tools",
    items: ["IntelliJ IDEA", "VS Code", "XAMPP"],
  },
  {
    label: "Core concepts",
    items: ["Object-Oriented Programming", "Database Management"],
  },
];

export const experience = {
  title: "Independent Software Development & Self-Learning",
  points: [
    "Develop personal projects independently using programming technologies and AI-assisted learning.",
    "Practice problem-solving, debugging and software development concepts.",
    "Continuously improve programming and technical skills.",
  ],
};

export const principles = [
  {
    title: "Practical software",
    body: "Build applications that do a real job — reservations, authentication, payments, receipts, and reports.",
  },
  {
    title: "Learn by doing",
    body: "Develop personal projects independently, and use AI-assisted learning while practicing the fundamentals.",
  },
  {
    title: "Respect the data",
    body: "Database management is part of the product. MySQL holds the ticket system together.",
  },
  {
    title: "Keep improving",
    body: "Problem-solving, debugging, and a steady climb in programming skill — semester by semester.",
  },
];

export const crew = [
  "Scout",
  "Layout",
  "Typeset",
  "Motion",
  "QA",
  "Deploy",
  "Copy",
  "Lint",
  "Index",
  "Render",
  "Palette",
  "Review",
] as const;
