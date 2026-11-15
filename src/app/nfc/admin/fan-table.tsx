"use client";

import { useState } from "react";
import AddFan from "./add-fan";
import FanRow from "./fan-row";
import styles from "../nfc.module.css";

type Row = { tagId: string | null; fanId: string | null; writtenAt: string | null; submittedAt: string | null; name: string; email: string; instagram: string };
type View = "all" | "signed" | "awaiting";

export default function FanTable({ rows }: { rows: Row[] }) {
  const [view, setView] = useState<View>("signed");
  const signed = rows.filter(row => Boolean(row.email));
  const awaiting = rows.filter(row => row.tagId && !row.email);
  const visible = view === "signed" ? signed : view === "awaiting" ? awaiting : rows;
  const filters: {value: View; label: string; count: number}[] = [
    {value:"signed",label:"Fan sign-up",count:signed.length},
    {value:"awaiting",label:"Awaiting sign-up",count:awaiting.length},
    {value:"all",label:"All tags",count:rows.length},
  ];
  return <>
    <div className={styles.filters} role="group" aria-label="Filter tags">
      {filters.map(filter => <button type="button" key={filter.value} aria-pressed={view === filter.value} onClick={()=>setView(filter.value)}>{filter.label}</button>)}
    </div>
    <p role="status" aria-live="polite">Showing {visible.length} {visible.length === 1 ? "record" : "records"}.</p>
    <div className={styles.tableWrap}><table><caption>{filters.find(filter=>filter.value===view)?.label}</caption>
      <thead><tr><th>Name</th><th>Email</th><th>Instagram</th><th>Status</th><th>Sign-up date</th><th>Tag ID</th><th>Actions</th></tr></thead>
      <tbody>{view === "signed" && <AddFan />}{visible.map(row => <FanRow key={row.fanId || row.tagId} row={row} />)}</tbody>
    </table>{visible.length === 0 && <p>No records in this view.</p>}</div>
  </>;
}
