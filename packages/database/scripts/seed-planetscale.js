const fs = require("fs/promises");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const seedFilePath = path.join(__dirname, "..", "db", "content-seed-v5.sql");

const getDirectDatabaseUrl = () =>
  process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "";

const isPostgresUrl = (url) => /^postgres(ql)?:/i.test(url ?? "");

const directUrl = getDirectDatabaseUrl();
if (!directUrl) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL for seeding.");
}

if (!isPostgresUrl(directUrl)) {
  throw new Error(
    "Seed script requires a Postgres connection string for the Prisma PG adapter."
  );
}

const pool = new Pool({ connectionString: directUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const stripComments = (sql) =>
  sql
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

const COLUMN_OVERRIDES = {
  page_id: "pageId",
  section_key: "sectionKey",
  content_type: "contentType",
  sort_order: "sortOrder",
  meta_description: "metaDescription",
  section_type: "sectionType",
  expected_content: "expectedContent",
};

const toCamelCase = (value) =>
  value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const mapColumnName = (column) =>
  COLUMN_OVERRIDES[column] ?? toCamelCase(column);

const splitSqlList = (input) => {
  const items = [];
  let current = "";
  let inString = false;
  let depth = 0;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inString) {
      if (char === "'" && input[i + 1] === "'") {
        current += "''";
        i += 1;
        continue;
      }
      if (char === "'") {
        inString = false;
        current += char;
        continue;
      }
      current += char;
      continue;
    }

    if (char === "'") {
      inString = true;
      current += char;
      continue;
    }

    if (char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      depth = Math.max(0, depth - 1);
      current += char;
      continue;
    }

    if (char === "," && depth === 0) {
      if (current.trim()) items.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) items.push(current.trim());
  return items;
};

const parseValuesList = (valuesText) => {
  const rows = [];
  let row = [];
  let current = "";
  let currentWasQuoted = false;
  let inString = false;
  let depth = 0;

  for (let i = 0; i < valuesText.length; i += 1) {
    const char = valuesText[i];

    if (inString) {
      if (char === "'" && valuesText[i + 1] === "'") {
        current += "'";
        i += 1;
        continue;
      }
      if (char === "'") {
        inString = false;
        continue;
      }
      current += char;
      continue;
    }

    if (char === "'") {
      inString = true;
      currentWasQuoted = true;
      continue;
    }

    if (char === "(") {
      if (depth === 0) {
        row = [];
        current = "";
        currentWasQuoted = false;
      }
      depth += 1;
      continue;
    }

    if (char === ")") {
      depth -= 1;
      if (depth === 0) {
        row.push({ value: current.trim(), wasQuoted: currentWasQuoted });
        rows.push(row);
        row = [];
        current = "";
        currentWasQuoted = false;
        continue;
      }
      current += char;
      continue;
    }

    if (char === "," && depth === 1) {
      row.push({ value: current.trim(), wasQuoted: currentWasQuoted });
      current = "";
      currentWasQuoted = false;
      continue;
    }

    current += char;
  }

  return rows;
};

const parseJsonValue = (value) => {
  let trimmed = value.trim().replace(/::jsonb?$/i, "");
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    trimmed = trimmed.slice(1, -1).replace(/''/g, "'");
  }
  if (!trimmed) return value;
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return value;
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return value;
  }
};

const parseSqlValue = (token) => {
  const raw = typeof token === "string" ? token : token.value;
  let wasQuoted = typeof token === "object" ? token.wasQuoted : false;
  let trimmed = raw.trim();
  let cast = null;

  const castMatch = trimmed.match(/^(.*?)(::[a-zA-Z0-9_]+)$/);
  if (castMatch) {
    trimmed = castMatch[1].trim();
    cast = castMatch[2].slice(2).toLowerCase();
  }

  if (!wasQuoted && trimmed.startsWith("'") && trimmed.endsWith("'")) {
    wasQuoted = true;
    trimmed = trimmed.slice(1, -1).replace(/''/g, "'");
  } else if (wasQuoted) {
    trimmed = trimmed.replace(/''/g, "'");
  }

  if (!wasQuoted && trimmed.toLowerCase() === "null") return null;
  if (!wasQuoted && (trimmed === "true" || trimmed === "false")) {
    return trimmed === "true";
  }
  if (!wasQuoted && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (cast === "jsonb" || cast === "json") {
    return parseJsonValue(trimmed);
  }

  return parseJsonValue(trimmed);
};

const compactObject = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  );

const getInsertBlocks = (sql, table) => {
  const matcher = new RegExp(`INSERT INTO public\\.${table}[\\s\\S]*?;`, "g");
  return sql.match(matcher) ?? [];
};

const parseSimpleInsert = (statement) => {
  const columnsMatch = statement.match(/\(([^)]+)\)\s*VALUES/i);
  const valuesMatch = statement.match(/VALUES\s*([\s\S]*?)(?:ON CONFLICT|;)/i);

  if (!columnsMatch || !valuesMatch) return [];

  const columns = splitSqlList(columnsMatch[1]).map((value) =>
    value.trim().replace(/"/g, "")
  );
  const rows = parseValuesList(valuesMatch[1]);

  return rows.map((row) =>
    columns.reduce((acc, column, index) => {
      acc[mapColumnName(column)] = parseSqlValue(row[index]);
      return acc;
    }, {})
  );
};

const parsePages = (sql) => {
  const statement = getInsertBlocks(sql, "pages")[0];
  return statement ? parseSimpleInsert(statement) : [];
};

const parseSiteSections = (sql) => {
  const statement = getInsertBlocks(sql, "site_sections")[0];
  return statement ? parseSimpleInsert(statement) : [];
};

const parseRouteSections = (sql) => {
  const statement = getInsertBlocks(sql, "route_sections")[0];
  if (!statement) return [];

  const valuesMatch = statement.match(
    /VALUES\s*([\s\S]*?)\)\s*AS v\(([^)]+)\)/i
  );
  if (!valuesMatch) return [];

  const valuesText = valuesMatch[1];
  const vColumns = splitSqlList(valuesMatch[2]).map((value) => value.trim());
  const rows = parseValuesList(valuesText);

  return rows.map((row) =>
    vColumns.reduce((acc, column, index) => {
      acc[mapColumnName(column)] = parseSqlValue(row[index]);
      return acc;
    }, {})
  );
};

const parsePageSections = (sql) => {
  const statements = getInsertBlocks(sql, "page_sections");

  return statements
    .map((statement) => {
      const selectMatch = statement.match(
        /SELECT\s+([\s\S]*?)\s+FROM public\.pages p/i
      );
      const routeMatch = statement.match(/WHERE p\.route = '([^']+)'/i);
      if (!selectMatch || !routeMatch) return null;

      const selectItems = splitSqlList(selectMatch[1]);
      if (selectItems.length < 6) return null;

      return {
        route: routeMatch[1],
        sectionKey: parseSqlValue(selectItems[1]),
        sectionType: parseSqlValue(selectItems[2]),
        content: parseSqlValue(selectItems[3]),
        sortOrder: parseSqlValue(selectItems[4]),
        active: parseSqlValue(selectItems[5]),
      };
    })
    .filter(Boolean);
};

const parseSelectItem = (item) => {
  const trimmed = item.trim();
  if (trimmed === "p.id") {
    return { type: "pageId" };
  }

  const vMatch = trimmed.match(/^v\.([a-zA-Z0-9_]+)(::[a-zA-Z0-9_]+)?$/);
  if (vMatch) {
    return { type: "v", key: vMatch[1] };
  }

  return { type: "literal", value: parseSqlValue(trimmed) };
};

const buildRowData = (columns, row) =>
  columns.reduce((acc, column, index) => {
    acc[column] = parseSqlValue(row[index]);
    return acc;
  }, {});

const buildContentItemData = (columns, selectItems, rowData, pageId) =>
  columns.reduce((acc, column, index) => {
    const targetKey = mapColumnName(column);
    const selectItem = parseSelectItem(selectItems[index]);

    if (selectItem.type === "pageId") {
      acc[targetKey] = pageId;
      return acc;
    }

    if (selectItem.type === "v") {
      acc[targetKey] = rowData[selectItem.key];
      return acc;
    }

    acc[targetKey] = selectItem.value;
    return acc;
  }, {});

const parseContentItems = (sql) => {
  const statements = getInsertBlocks(sql, "content_items");

  return statements.flatMap((statement) => {
    const columnsMatch = statement.match(
      /INSERT INTO public\.content_items\s*\(([^)]+)\)\s*SELECT/i
    );
    const selectMatch = statement.match(
      /SELECT\s+([\s\S]*?)\s+FROM public\.pages p/i
    );
    const routeMatch = statement.match(/WHERE p\.route = '([^']+)'/i);
    const valuesMatch = statement.match(
      /VALUES\s*([\s\S]*?)\)\s*AS v\(([^)]+)\)/i
    );

    if (!columnsMatch || !selectMatch || !routeMatch || !valuesMatch) {
      return [];
    }

    const columns = splitSqlList(columnsMatch[1]).map((value) =>
      value.trim()
    );
    const selectItems = splitSqlList(selectMatch[1]);
    const valuesRows = parseValuesList(valuesMatch[1]);
    const vColumns = splitSqlList(valuesMatch[2]).map((value) => value.trim());

    return valuesRows.map((row) => ({
      route: routeMatch[1],
      columns,
      selectItems,
      rowData: buildRowData(vColumns, row),
    }));
  });
};

const parseFaqs = (sql) => {
  const statement = getInsertBlocks(sql, "faqs")[0];
  return statement ? parseSimpleInsert(statement) : [];
};

const REQUIRED_PAGES = [
  {
    route: "/",
    title: "EFL Explorers - Home",
    metaDescription: "Start your English learning journey with EFL Explorers",
  },
  {
    route: "/about",
    title: "About EFL Explorers",
    metaDescription:
      "Learn more about the EFL Explorers team, mission, and vision",
  },
  {
    route: "/contact",
    title: "Contact EFL Explorers",
    metaDescription:
      "Get in touch with EFL Explorers for course and platform information",
  },
  {
    route: "/pricing",
    title: "Pricing - EFL Explorers",
    metaDescription:
      "Choose the best plan to improve your English skills with EFL Explorers.",
  },
  {
    route: "/platforms/student",
    title: "Student Platform - EFL Explorers",
    metaDescription:
      "Explore the student portal and learning journey inside EFL Explorers.",
  },
  {
    route: "/platforms/teacher",
    title: "Teacher Platform - EFL Explorers",
    metaDescription:
      "Explore the teacher portal and teaching toolkit inside EFL Explorers.",
  },
  {
    route: "/Auth/login",
    title: "Login - EFL Explorers",
    metaDescription: "Login to your EFL Explorers account",
  },
  {
    route: "/Auth/register",
    title: "Register - EFL Explorers",
    metaDescription: "Create your EFL Explorers account",
  },
  {
    route: "/Auth/forgot-password",
    title: "Forgot Password - EFL Explorers",
    metaDescription: "Reset your password",
  },
  {
    route: "/Auth/reset-password",
    title: "Reset Password - EFL Explorers",
    metaDescription: "Set your new password",
  },
  {
    route: "/Auth/register/teacher/pending",
    title: "Registration Pending - EFL Explorers",
    metaDescription: "Your teacher registration is under review",
  },
];

const AUTH_LOGIN_CONTENT = {
  title: "Welcome Back",
  subtitle: "Select your platform to continue:",
  student_button_label: "Student Login",
  teacher_button_label: "Teacher Login",
  register_prompt: "New to EFL Explorers?",
  register_link_text: "Register here",
  register_href: "/Auth/register",
};

const AUTH_REGISTER_CONTENT = {
  title: "Join EFL Explorers",
  subtitle: "Choose your account type:",
  student_button_label: "Register as Student",
  teacher_button_label: "Register as Teacher",
  login_prompt: "Already have an account?",
  login_link_text: "Login here",
  login_href: "/Auth/login",
};

const AUTH_FORGOT_PASSWORD_CONTENT = {
  form: {
    title: "Forgot Password",
    subtitle: "Enter your email to reset your password",
    email_label: "Email",
    submit_button_label: "Send Reset Link",
    submit_button_loading_label: "Sending...",
    back_to_login_text: "Back to Login",
    back_to_login_href: "/Auth/login",
  },
  success: {
    title: "Check Your Email",
    subtitle: "We've sent you a password reset link",
    message1: "We've sent a password reset link to {email}.",
    message2:
      "Please check your email and click the link to reset your password. The link will expire in 1 hour.",
    return_text: "Return to Login",
    return_href: "/Auth/login",
  },
};

const AUTH_RESET_PASSWORD_CONTENT = {
  form: {
    title: "Reset Password",
    subtitle: "Enter your new password",
    new_password_label: "New Password",
    confirm_password_label: "Confirm New Password",
    submit_button_label: "Update Password",
    submit_button_loading_label: "Updating...",
    back_to_login_text: "Back to Login",
    back_to_login_href: "/Auth/login",
  },
  success: {
    title: "Password Updated",
    subtitle: "Your password has been successfully reset",
    message:
      "Your password has been successfully updated. You can now log in with your new password.",
    go_to_login_text: "Go to Login",
    go_to_login_href: "/Auth/login",
  },
};

const AUTH_PENDING_CONTENT = {
  title: "Registration Pending",
  messages: [
    "Thank you for registering as a teacher with EFL Explorers. Your application is currently under review.",
  ],
  button_label: "Return to Login",
  button_href: "/Auth/login",
};

const DEFAULT_SITE_SECTIONS = [
  {
    sectionKey: "header",
    sectionType: "header",
    content: {
      navbar: {
        dropdown: {
          label: "Platforms",
          items: [
            { label: "Teacher", href: "/platforms/teacher" },
            { label: "Student", href: "/platforms/student" },
          ],
        },
        links: [
          { label: "Pricing", href: "/pricing" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
      auth_buttons: {
        login: { label: "Login", href: "/Auth/login" },
        register: { label: "Get Started", href: "/Auth/register" },
      },
    },
    sortOrder: 10,
    active: true,
  },
  {
    sectionKey: "footer",
    sectionType: "footer",
    content: {
      columns: [],
      bottom_bar: ["All rights reserved"],
    },
    sortOrder: 20,
    active: true,
  },
  {
    sectionKey: "404",
    sectionType: "error",
    content: {
      title: "404 - Page Not Found",
      message: "The page you're looking for doesn't exist.",
      home_link_text: "Go back home",
    },
    sortOrder: 30,
    active: true,
  },
];

const REQUIRED_PAGE_SECTIONS = [
  { route: "/", sectionKey: "hero", sectionType: "hero", content: {}, sortOrder: 10 },
  { route: "/", sectionKey: "tagline", sectionType: "content", content: {}, sortOrder: 20 },
  { route: "/", sectionKey: "learning-tools", sectionType: "content", content: {}, sortOrder: 30 },
  { route: "/", sectionKey: "how-we-teach", sectionType: "tabs", content: {}, sortOrder: 40 },
  { route: "/", sectionKey: "services", sectionType: "content", content: {}, sortOrder: 50 },
  { route: "/", sectionKey: "pricing", sectionType: "content", content: {}, sortOrder: 60 },
  { route: "/", sectionKey: "register-cta", sectionType: "cta", content: {}, sortOrder: 100 },
  { route: "/about", sectionKey: "hero", sectionType: "hero", content: {}, sortOrder: 10 },
  { route: "/about", sectionKey: "description", sectionType: "content", content: {}, sortOrder: 20 },
  { route: "/about", sectionKey: "tagline", sectionType: "content", content: {}, sortOrder: 30 },
  { route: "/about", sectionKey: "mission", sectionType: "content", content: {}, sortOrder: 40 },
  { route: "/about", sectionKey: "vision", sectionType: "content", content: {}, sortOrder: 50 },
  { route: "/about", sectionKey: "team-intro", sectionType: "content", content: {}, sortOrder: 60 },
  { route: "/about", sectionKey: "values-header", sectionType: "content", content: {}, sortOrder: 70 },
  { route: "/contact", sectionKey: "hero", sectionType: "content", content: {}, sortOrder: 10 },
  { route: "/contact", sectionKey: "form", sectionType: "content", content: {}, sortOrder: 20 },
  { route: "/contact", sectionKey: "faq", sectionType: "content", content: {}, sortOrder: 30 },
  { route: "/pricing", sectionKey: "pricing-header", sectionType: "content", content: {}, sortOrder: 10 },
  { route: "/pricing", sectionKey: "pricing-footer", sectionType: "content", content: {}, sortOrder: 30 },
  { route: "/platforms/student", sectionKey: "hero", sectionType: "content", content: {}, sortOrder: 10 },
  { route: "/platforms/student", sectionKey: "characters", sectionType: "content", content: {}, sortOrder: 20 },
  { route: "/platforms/student", sectionKey: "planets", sectionType: "content", content: {}, sortOrder: 30 },
  { route: "/platforms/student", sectionKey: "cta", sectionType: "content", content: {}, sortOrder: 40 },
  { route: "/platforms/teacher", sectionKey: "hero", sectionType: "content", content: {}, sortOrder: 10 },
  { route: "/platforms/teacher", sectionKey: "tools", sectionType: "content", content: {}, sortOrder: 20 },
  { route: "/platforms/teacher", sectionKey: "lesson-modules", sectionType: "content", content: {}, sortOrder: 30 },
  { route: "/platforms/teacher", sectionKey: "benefits", sectionType: "content", content: {}, sortOrder: 40 },
  { route: "/platforms/teacher", sectionKey: "cta", sectionType: "content", content: {}, sortOrder: 50 },
  {
    route: "/Auth/login",
    sectionKey: "selection",
    sectionType: "content",
    content: AUTH_LOGIN_CONTENT,
    sortOrder: 10,
  },
  {
    route: "/Auth/register",
    sectionKey: "selection",
    sectionType: "content",
    content: AUTH_REGISTER_CONTENT,
    sortOrder: 10,
  },
  {
    route: "/Auth/forgot-password",
    sectionKey: "form",
    sectionType: "content",
    content: AUTH_FORGOT_PASSWORD_CONTENT,
    sortOrder: 10,
  },
  {
    route: "/Auth/reset-password",
    sectionKey: "form",
    sectionType: "content",
    content: AUTH_RESET_PASSWORD_CONTENT,
    sortOrder: 10,
  },
  {
    route: "/Auth/register/teacher/pending",
    sectionKey: "content",
    sectionType: "content",
    content: AUTH_PENDING_CONTENT,
    sortOrder: 10,
  },
];

const REQUIRED_CONTENT_ITEMS = [
  {
    route: "/",
    contentType: "pricing",
    sectionKey: "pricing",
    slug: "pricing-default",
    title: "Free Access",
    content: { price: "Free", description: "Basic access" },
    sortOrder: 10,
  },
  {
    route: "/",
    contentType: "service",
    sectionKey: "services",
    slug: "service-default",
    title: "Service",
    description: "Default service",
    content: { icon: "book", background_icons: [] },
    sortOrder: 10,
  },
  {
    route: "/",
    contentType: "learning_tool",
    sectionKey: "learning-tools",
    slug: "learning-tool-default",
    title: "Learning Tool",
    description: "Default learning tool",
    content: { icon: "tool" },
    sortOrder: 10,
  },
  {
    route: "/about",
    contentType: "team_member",
    sectionKey: "team",
    slug: "team-member-default",
    title: "Team Member",
    subtitle: "Role",
    description: "Team member bio",
    content: { role: "Role", image: "", expertise: [] },
    sortOrder: 10,
  },
  {
    route: "/about",
    contentType: "about_stat",
    sectionKey: "stats",
    slug: "about-stat-default",
    title: "1",
    description: "Default stat",
    sortOrder: 10,
  },
  {
    route: "/about",
    contentType: "core_value",
    sectionKey: "values",
    slug: "core-value-default",
    title: "Core Value",
    description: "Default core value",
    content: { icon: "star" },
    sortOrder: 10,
  },
  {
    route: "/contact",
    contentType: "faq",
    sectionKey: "faq",
    slug: "faq-default",
    title: "How do I get started?",
    description: "Reach out to get started.",
    content: { category: "contact" },
    sortOrder: 10,
  },
  {
    route: "/pricing",
    contentType: "pricing_plan",
    sectionKey: "pricing-plans",
    slug: "pricing-plan-default",
    title: "Basic",
    description: "Default pricing plan",
    content: { price: "0", currency: "$", period: "/month", features: [] },
    sortOrder: 10,
  },
  {
    route: "/platforms/student",
    contentType: "student_character",
    sectionKey: "characters",
    slug: "student-character-default",
    title: "Student",
    content: { imageUrl: "/assets/images/characters/Student.png" },
    sortOrder: 10,
  },
  {
    route: "/platforms/student",
    contentType: "student_planet",
    sectionKey: "planets",
    slug: "student-planet-default",
    title: "Planet",
    content: { color: "var(--accent)", icon: "planet" },
    sortOrder: 10,
  },
  {
    route: "/platforms/teacher",
    contentType: "teaching_tool",
    sectionKey: "tools",
    slug: "teacher-tool-default",
    title: "Teaching Tool",
    description: "Default teaching tool",
    content: { icon: "tool" },
    sortOrder: 10,
  },
  {
    route: "/platforms/teacher",
    contentType: "lesson_module",
    sectionKey: "lesson-modules",
    slug: "lesson-module-default",
    title: "Lesson Module",
    description: "Default lesson module",
    content: {
      students: "10",
      lessons: "10",
      duration: "4 weeks",
      colorKey: "muted",
    },
    sortOrder: 10,
  },
  {
    route: "/platforms/teacher",
    contentType: "teacher_benefit",
    sectionKey: "benefits",
    slug: "teacher-benefit-default",
    title: "Benefit",
    description: "Default benefit",
    sortOrder: 10,
  },
];

const REQUIRED_SECTION_FIELDS = {
  "/Auth/login|selection": [
    "title",
    "subtitle",
    "student_button_label",
    "teacher_button_label",
    "register_prompt",
    "register_link_text",
    "register_href",
  ],
  "/Auth/register|selection": [
    "title",
    "subtitle",
    "student_button_label",
    "teacher_button_label",
    "login_prompt",
    "login_link_text",
    "login_href",
  ],
  "/Auth/forgot-password|form": [
    "form.title",
    "form.subtitle",
    "form.email_label",
    "form.submit_button_label",
    "form.submit_button_loading_label",
    "form.back_to_login_text",
    "form.back_to_login_href",
    "success.title",
    "success.subtitle",
    "success.message1",
    "success.message2",
    "success.return_text",
    "success.return_href",
  ],
  "/Auth/reset-password|form": [
    "form.title",
    "form.subtitle",
    "form.new_password_label",
    "form.confirm_password_label",
    "form.submit_button_label",
    "form.submit_button_loading_label",
    "form.back_to_login_text",
    "form.back_to_login_href",
    "success.title",
    "success.subtitle",
    "success.message",
    "success.go_to_login_text",
    "success.go_to_login_href",
  ],
  "/Auth/register/teacher/pending|content": [
    "title",
    "messages",
    "button_label",
    "button_href",
  ],
};

const getNestedValue = (value, path) =>
  path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), value);

const hasRequiredFields = (content, paths) =>
  paths.every((path) => {
    const value = getNestedValue(content, path);
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });

const ensureLandingPageDefaults = async (pagesByRoute) => {
  for (const page of REQUIRED_PAGES) {
    const existing = await prisma.page.findUnique({
      where: { route: page.route },
      select: { id: true, title: true, metaDescription: true },
    });
    if (!existing) {
      const created = await prisma.page.create({
        data: {
          route: page.route,
          title: page.title,
          metaDescription: page.metaDescription,
        },
      });
      pagesByRoute.set(page.route, created.id);
      continue;
    }
    pagesByRoute.set(page.route, existing.id);
    const updates = {};
    if (!existing.title && page.title) updates.title = page.title;
    if (!existing.metaDescription && page.metaDescription)
      updates.metaDescription = page.metaDescription;
    if (Object.keys(updates).length > 0) {
      await prisma.page.update({
        where: { route: page.route },
        data: updates,
      });
    }
  }

  for (const section of DEFAULT_SITE_SECTIONS) {
    const existing = await prisma.siteSection.findUnique({
      where: { sectionKey: section.sectionKey },
      select: { id: true, content: true },
    });
    if (!existing) {
      await prisma.siteSection.create({ data: section });
      continue;
    }
    if (section.sectionKey === "404") {
      const content = existing.content ?? {};
      const requiredPaths = ["title", "message", "home_link_text"];
      if (!hasRequiredFields(content, requiredPaths)) {
        await prisma.siteSection.update({
          where: { sectionKey: section.sectionKey },
          data: { content: section.content },
        });
      }
    }
  }

  for (const section of REQUIRED_PAGE_SECTIONS) {
    const pageId = pagesByRoute.get(section.route);
    if (!pageId) continue;

    const existing = await prisma.pageSection.findUnique({
      where: { pageId_sectionKey: { pageId, sectionKey: section.sectionKey } },
      select: { id: true, content: true },
    });

    if (!existing) {
      await prisma.pageSection.create({
        data: {
          pageId,
          sectionKey: section.sectionKey,
          sectionType: section.sectionType,
          content: section.content,
          sortOrder: section.sortOrder ?? 0,
          active: true,
        },
      });
      continue;
    }

    const requiredPaths =
      REQUIRED_SECTION_FIELDS[`${section.route}|${section.sectionKey}`];
    if (requiredPaths && !hasRequiredFields(existing.content ?? {}, requiredPaths)) {
      await prisma.pageSection.update({
        where: { pageId_sectionKey: { pageId, sectionKey: section.sectionKey } },
        data: { content: section.content },
      });
    }
  }

  for (const item of REQUIRED_CONTENT_ITEMS) {
    const pageId = pagesByRoute.get(item.route);
    if (!pageId) continue;

    const existingCount = await prisma.contentItem.count({
      where: { pageId, contentType: item.contentType },
    });

    if (existingCount > 0) {
      continue;
    }

    await prisma.contentItem.create({
      data: compactObject({
        pageId,
        sectionKey: item.sectionKey,
        contentType: item.contentType,
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        content: item.content,
        sortOrder: item.sortOrder ?? 0,
        active: true,
      }),
    });
  }
};

const run = async () => {
  const raw = await fs.readFile(seedFilePath, "utf-8");
  const sql = stripComments(raw).replace(/\r\n/g, "\n");

  const pages = parsePages(sql);
  await Promise.all(
    pages.map(({ route, ...data }) =>
      prisma.page.upsert({
        where: { route },
        create: { route, ...compactObject(data) },
        update: compactObject(data),
      })
    )
  );

  const pagesByRoute = new Map(
    (
      await prisma.page.findMany({
        select: { id: true, route: true },
      })
    ).map((row) => [row.route, row.id])
  );

  const siteSections = parseSiteSections(sql);
  await Promise.all(
    siteSections.map(({ sectionKey, ...data }) =>
      prisma.siteSection.upsert({
        where: { sectionKey },
        create: { sectionKey, ...compactObject(data) },
        update: compactObject(data),
      })
    )
  );

  const routeSections = parseRouteSections(sql);
  await Promise.all(
    routeSections.map((section) => {
      const pageId = pagesByRoute.get(section.route);
      if (!pageId) {
        throw new Error(`Missing page for route "${section.route}".`);
      }
      const data = compactObject({
        pageId,
        sectionKey: section.sectionKey,
        sectionType: section.sectionType,
        expectedContent: section.expectedContent,
        sortOrder: section.sortOrder,
        active: section.active,
      });
      return prisma.routeSection.upsert({
        where: { pageId_sectionKey: { pageId, sectionKey: section.sectionKey } },
        create: data,
        update: data,
      });
    })
  );

  const pageSections = parsePageSections(sql);
  await Promise.all(
    pageSections.map((section) => {
      const pageId = pagesByRoute.get(section.route);
      if (!pageId) {
        throw new Error(`Missing page for route "${section.route}".`);
      }
      const data = compactObject({
        pageId,
        sectionKey: section.sectionKey,
        sectionType: section.sectionType,
        content: section.content,
        sortOrder: section.sortOrder,
        active: section.active,
      });
      return prisma.pageSection.upsert({
        where: { pageId_sectionKey: { pageId, sectionKey: section.sectionKey } },
        create: data,
        update: data,
      });
    })
  );

  const contentItems = parseContentItems(sql);
  await Promise.all(
    contentItems.map((item) => {
      const pageId = pagesByRoute.get(item.route);
      if (!pageId) {
        throw new Error(`Missing page for route "${item.route}".`);
      }
      const data = compactObject(
        buildContentItemData(
          item.columns,
          item.selectItems,
          item.rowData,
          pageId
        )
      );

      if (!data.slug) {
        return prisma.contentItem.create({ data });
      }

      return prisma.contentItem.upsert({
        where: { slug: data.slug },
        create: data,
        update: data,
      });
    })
  );

  const faqs = parseFaqs(sql);
  for (const faq of faqs) {
    const existing = await prisma.faq.findFirst({
      where: {
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
      },
      select: { id: true },
    });
    if (!existing) {
      await prisma.faq.create({ data: compactObject(faq) });
    }
  }

  await ensureLandingPageDefaults(pagesByRoute);

  console.log("Seed complete.");
};

run()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
