const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1QA51CrINL1XTkOrbYAnQBui0_c7AdjQxLwim8qlXzcs/gviz/tq?tqx=out:csv";

export async function GET() {
  try {
    const response = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!response.ok) {
      return Response.json({ error: "Google Sheet is not publicly readable" }, { status: 503 });
    }

    const records = parseCsv(await response.text());
    const headers = (records.shift() ?? []).map((header, index) => header.trim() || `Column ${index + 1}`);
    const rows = records
      .map((row) => headers.map((_, index) => (row[index] ?? "").trim()))
      .filter((row) => row.some(Boolean));

    return Response.json(
      { headers, rows },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch {
    return Response.json({ error: "Directory unavailable" }, { status: 503 });
  }
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"') {
      if (quoted && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}
