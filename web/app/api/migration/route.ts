import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { filterMigrationData, getMigrationHeatCells, getMigrationSummary, type MigrationDataset } from "@/lib/migration-data";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const rawMonth = params.get("month");
  const month = rawMonth && rawMonth !== "all" ? Number(rawMonth) : null;
  if (month != null && (!Number.isInteger(month) || month < 1 || month > 12)) {
    return NextResponse.json({ error: "month must be an integer from 1 to 12, or all" }, { status: 400 });
  }
  try {
    const raw = await readFile(path.join(process.cwd(), "public/data/migration-snapshot.json"), "utf8");
    const snapshot = JSON.parse(raw) as MigrationDataset;
    const species = params.get("species") || "all";
    if (species !== "all" && !snapshot.species.some((s) => s.id === species)) {
      return NextResponse.json({ error: "Unknown species", availableSpecies: snapshot.species.map((s) => s.id) }, { status: 400 });
    }
    const data = filterMigrationData(snapshot, { month, species });
    return NextResponse.json({ ...data, filter: { month, species }, summary: getMigrationSummary(data), heatCells: getMigrationHeatCells(data) }, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch (error) {
    console.error("Migration snapshot unavailable", error);
    return NextResponse.json({ error: "The verified migration snapshot is unavailable. Please try again later." }, { status: 503 });
  }
}
