export function tagStatusLabel(row: { tagId: string | null; fanId: string | null; writtenAt: string | null }): "Created" | "Pending" | "Active" | "No tag" {
  if (!row.tagId) return "No tag";
  if (row.fanId) return "Active";
  return row.writtenAt ? "Pending" : "Created";
}
