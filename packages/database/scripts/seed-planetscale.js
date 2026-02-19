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
  const trimmed = value.trim();
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
