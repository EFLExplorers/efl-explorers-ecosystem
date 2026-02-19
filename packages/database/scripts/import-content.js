const { PrismaClient } = require("@prisma/client");
const fs = require("fs/promises");
const path = require("path");

const prisma = new PrismaClient();

const dataDir = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(process.cwd(), "scripts", "data");

const readJsonFile = async (fileName) => {
  try {
    const raw = await fs.readFile(path.join(dataDir, fileName), "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
};

const parseJsonField = (value) => {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

const toDate = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

const importPages = async () => {
  const rows = await readJsonFile("pages.json");
  if (!rows || rows.length === 0) return;

  await prisma.page.createMany({
    data: rows.map((row) => ({
      id: row.id,
      route: row.route,
      title: row.title ?? null,
      metaDescription: row.meta_description ?? null,
      layout: row.layout ?? "default",
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    })),
    skipDuplicates: true,
  });
};

const importPageSections = async () => {
  const rows = await readJsonFile("page_sections.json");
  if (!rows || rows.length === 0) return;

  await prisma.pageSection.createMany({
    data: rows.map((row) => ({
      id: row.id,
      pageId: row.page_id ?? null,
      sectionKey: row.section_key,
      sectionType: row.section_type ?? "content",
      title: row.title ?? null,
      subtitle: row.subtitle ?? null,
      heading: row.heading ?? null,
      subheading: row.subheading ?? null,
      body: row.body ?? null,
      ctaLabel: row.cta_label ?? null,
      ctaHref: row.cta_href ?? null,
      content: parseJsonField(row.content),
      settings: parseJsonField(row.settings),
      data: parseJsonField(row.data),
      sortOrder: row.sort_order ?? 0,
      active: row.active ?? true,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    })),
    skipDuplicates: true,
  });
};

const importContentItems = async () => {
  const rows = await readJsonFile("content_items.json");
  if (!rows || rows.length === 0) return;

  await prisma.contentItem.createMany({
    data: rows.map((row) => ({
      id: row.id,
      pageId: row.page_id ?? null,
      sectionKey: row.section_key ?? null,
      contentType: row.content_type,
      slug: row.slug ?? null,
      title: row.title ?? null,
      subtitle: row.subtitle ?? null,
      description: row.description ?? null,
      content: parseJsonField(row.content),
      metadata: parseJsonField(row.metadata),
      sortOrder: row.sort_order ?? 0,
      active: row.active ?? true,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    })),
    skipDuplicates: true,
  });
};

const importSiteSections = async () => {
  const rows = await readJsonFile("site_sections.json");
  if (!rows || rows.length === 0) return;

  await prisma.siteSection.createMany({
    data: rows.map((row) => ({
      id: row.id,
      sectionKey: row.section_key,
      sectionType: row.section_type ?? "content",
      content: parseJsonField(row.content),
      settings: parseJsonField(row.settings),
      sortOrder: row.sort_order ?? 0,
      active: row.active ?? true,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    })),
    skipDuplicates: true,
  });
};

const importRouteSections = async () => {
  const rows = await readJsonFile("route_sections.json");
  if (!rows || rows.length === 0) return;

  await prisma.routeSection.createMany({
    data: rows.map((row) => ({
      id: row.id,
      pageId: row.page_id,
      sectionKey: row.section_key,
      sectionType: row.section_type ?? "content",
      expectedContent: parseJsonField(row.expected_content),
      notes: row.notes ?? null,
      sortOrder: row.sort_order ?? 0,
      active: row.active ?? true,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    })),
    skipDuplicates: true,
  });
};

const importContentRelationships = async () => {
  const rows = await readJsonFile("content_relationships.json");
  if (!rows || rows.length === 0) return;

  await prisma.contentRelationship.createMany({
    data: rows.map((row) => ({
      id: row.id,
      parentId: row.parent_id,
      childId: row.child_id,
      relationshipType: row.relationship_type,
      sortOrder: row.sort_order ?? 0,
      createdAt: toDate(row.created_at),
    })),
    skipDuplicates: true,
  });
};

const importMediaAssets = async () => {
  const rows = await readJsonFile("media_assets.json");
  if (!rows || rows.length === 0) return;

  await prisma.mediaAsset.createMany({
    data: rows.map((row) => ({
      id: row.id,
      filename: row.filename,
      originalName: row.original_name,
      url: row.url,
      altText: row.alt_text ?? null,
      caption: row.caption ?? null,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes ?? null,
      dimensions: parseJsonField(row.dimensions),
      metadata: parseJsonField(row.metadata),
      createdAt: toDate(row.created_at),
    })),
    skipDuplicates: true,
  });
};

const importUsers = async () => {
  const rows = await readJsonFile("users.json");
  if (!rows || rows.length === 0) return;

  await prisma.user.createMany({
    data: rows.map((row) => ({
      id: row.id,
      email: row.email ? row.email.toLowerCase() : null,
      role: row.role ?? "student",
      approved: row.approved ?? false,
      firstName: row.first_name ?? null,
      lastName: row.last_name ?? null,
      name:
        row.name ??
        `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() ||
        null,
      createdAt: toDate(row.created_at),
      updatedAt: toDate(row.updated_at),
    })),
    skipDuplicates: true,
  });
};

const run = async () => {
  console.log("Importing data from:", dataDir);

  await importPages();
  await importPageSections();
  await importContentItems();
  await importSiteSections();
  await importRouteSections();
  await importContentRelationships();
  await importMediaAssets();
  await importUsers();

  console.log("Import complete.");
};

run()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
