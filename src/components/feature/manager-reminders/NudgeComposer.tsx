import { Button, Chip, Field } from "../../ui";
import { initialsOf } from "../../../utils/format";
import type { ManagerNudge } from "../../../features/notifications/nudge";

export interface NudgeComposerProps {
  queue: ManagerNudge[];
  picks: Set<string>;
  onToggle: (managerId: string) => void;
  subject: string;
  onSubject: (value: string) => void;
  message: string;
  onMessage: (value: string) => void;
  busy: boolean;
  onRebuild: () => void;
  onSend: () => void;
}

/** ORGANISM — recipients chips, subject/message, dispatch controls. */
export function NudgeComposer({
  queue,
  picks,
  onToggle,
  subject,
  onSubject,
  message,
  onMessage,
  busy,
  onRebuild,
  onSend,
}: NudgeComposerProps) {
  const pickedCount = queue.filter((n) => picks.has(n.manager.user_id)).length;
  return (
    <div className="card form-card" style={{ maxWidth: 980 }}>
      <div className="form-body">
        <Field
          label="Recipients"
          required
          as="div"
          hint={
            pickedCount
              ? `${pickedCount} manager${pickedCount > 1 ? "s" : ""} picked`
              : "Pick managers from the table or the quick chips"
          }
        >
          <div className="chipbox">
            {queue.map((n) => (
              <Chip
                key={n.manager.user_id}
                isOn={picks.has(n.manager.user_id)}
                onClick={() => onToggle(n.manager.user_id)}
              >
                <span
                  style={{
                    display: "inline-flex",
                    gap: 6,
                    alignItems: "center",
                  }}
                >
                  <b style={{ fontWeight: 700 }}>
                    {initialsOf(n.manager.full_name)}
                  </b>{" "}
                  {n.manager.full_name} · {n.requests.length}
                </span>
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Subject" required htmlFor="rm-subj">
          <input
            id="rm-subj"
            className="input"
            value={subject}
            onChange={(e) => onSubject(e.target.value)}
          />
        </Field>

        <Field label="Message" required htmlFor="rm-msg">
          <textarea
            id="rm-msg"
            className="textarea"
            value={message}
            onChange={(e) => onMessage(e.target.value)}
          />
        </Field>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button
            variant="ghost"
            onClick={onRebuild}
            title="Regenerate subject + message from the picked managers"
          >
            Rebuild copy
          </Button>
          <Button onClick={onSend} busy={busy} busyLabel="Dispatching nudge">
            <span style={{ display: "inline-flex", gap: 6 }}>
              {pickedCount > 1
                ? `Send to ${pickedCount} managers`
                : "Send nudge"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
