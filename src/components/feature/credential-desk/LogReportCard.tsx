import { useState } from "react";
import { Button, Field } from "../../ui";
import type { DirectoryUser } from "../../../types/models";

export interface LogReportCardProps {
  people: DirectoryUser[];
  /** Raises the report; page shows toast. Return an error message to surface. */
  onLog: (userId: string) => Promise<string | null>;
  onError: (msg: string) => void;
}

/** ORGANISM — "log a report on behalf of a user" (they ring it in). */
export function LogReportCard({ people, onLog, onError }: LogReportCardProps) {
  const [logUserId, setLogUserId] = useState("");

  const logOnBehalf = async () => {
    if (!logUserId) {
      onError("Pick the employee who reported it.");
      return;
    }
    const res = await onLog(logUserId);
    if (res) {
      onError(res);
      return;
    }
    setLogUserId("");
  };

  return (
    <div className="card card--padded" style={{ marginBottom: 16 }}>
      <div className="hl-panel-head" style={{ padding: "0 0 12px" }}>
        <h3>Log a report on behalf of a user</h3>
        <span className="hl-count">IF THEY RING IT IN</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Field label="Who is locked out?" htmlFor="cr-user">
          <select
            id="cr-user"
            className="select"
            value={logUserId}
            onChange={(e) => setLogUserId(e.target.value)}
          >
            <option value="">— Select a person —</option>
            {people.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.full_name} · {u.emp_no}
              </option>
            ))}
          </select>
        </Field>
        <Button
          variant="ghost"
          size="sm"
          onClick={logOnBehalf}
          title="Raise the forgotten-password report"
        >
          Log the report
        </Button>
      </div>
    </div>
  );
}
