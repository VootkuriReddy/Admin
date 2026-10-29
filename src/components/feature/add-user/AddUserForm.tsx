import { useMemo, useState, type FormEvent } from "react";
import { Button, ConfirmModal, Field } from "../../ui";
import {
  currentYear,
  proRataAllocationFor,
} from "../../../features/balances/provisioning";
import {
  nextEmpNo,
  suggestEmail,
  suggestPassword,
} from "../../../features/users/generate";
import {
  joinedOnIssue,
  validateDraft,
  type UserDraft,
} from "../../../features/users/validateUser";
import { fmtDays } from "../../../utils/format";
import { ROLES } from "../../../constants";
import type { DirectoryUser } from "../../../types/models";
import { IconInfo, IconKey } from "../../Icons";

const BLANK: UserDraft = {
  full_name: "",
  email: "",
  emp_no: "",
  role: ROLES.Employee,
  job_title: "",
  manager_id: "",
  joined_on: "",
  password: "",
};

export interface AddUserFormProps {
  /** Directory so the form can suggest unique IDs/emails and resolve managers. */
  users: DirectoryUser[];
  /** Persistence: create the person; resolves to true once provisioned. */
  onSubmit: (draft: UserDraft) => Promise<boolean>;
  onError: (msg: string) => void;
}

/** ORGANISM — persona + credential + allocation preview + confirm, one pass. */
export function AddUserForm({ users, onSubmit, onError }: AddUserFormProps) {
  const [draft, setDraft] = useState<UserDraft>(() => ({
    ...BLANK,
    emp_no: nextEmpNo(users),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const managers = users.filter(
    (u) => u.role === ROLES.Manager && u.status === "Active",
  );

  const projected = useMemo(() => {
    if (!draft.joined_on) return false;
    const year = currentYear();
    if (joinedOnIssue(draft.joined_on)) return false;
    const { annualCredited, contingencyCredited } = proRataAllocationFor(
      draft.joined_on,
      year,
    );
    return (
      <div className="cred-preview">
        <span>Allocation preview · {year}</span>
        <b>
          Annual {fmtDays(annualCredited)} d{" · "}Contingency{" "}
          {fmtDays(contingencyCredited)} d{" · "}Carry-forward 0 d
        </b>
        <span>
          Pro-rated from the month of joining · take-up starts at zero
        </span>
      </div>
    );
  }, [draft.joined_on]);

  const set = <K extends keyof UserDraft>(key: K, value: UserDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const autofill = () => {
    setDraft((prev) => ({
      ...prev,
      email: prev.email || suggestEmail(prev.full_name, users),
      password: prev.password || suggestPassword(),
    }));
  };

  const startConfirm = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = validateDraft(draft, users);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      onError("Fix the highlighted fields before saving.");
      return;
    }
    setConfirming(true);
  };

  const submit = async () => {
    setBusy(true);
    const done = await onSubmit(draft);
    setBusy(false);
    if (done) return;
    onError("Could not add the person. Check the details and retry.");
    setConfirming(false);
  };

  return (
    <>
      <form className="card form-card" onSubmit={startConfirm}>
        <div className="form-body">
          <div className="form-row form-row--2">
            <Field
              label="Full name"
              required
              error={errors.full_name}
              htmlFor="au-name"
            >
              <input
                id="au-name"
                className="input"
                value={draft.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="e.g. Anjali Rao"
              />
            </Field>
            <Field
              label="Job title"
              required
              error={errors.job_title}
              htmlFor="au-title"
            >
              <input
                id="au-title"
                className="input"
                value={draft.job_title}
                onChange={(e) => set("job_title", e.target.value)}
                placeholder="e.g. Senior Engineer"
              />
            </Field>
          </div>

          <div className="form-row form-row--3">
            <Field
              label="Employee ID"
              required
              error={errors.emp_no}
              htmlFor="au-no"
              hint="Format EMP-0000 · auto next number"
            >
              <input
                id="au-no"
                className="input mono"
                value={draft.emp_no}
                onChange={(e) => set("emp_no", e.target.value.toUpperCase())}
              />
            </Field>
            <Field
              label="Corporate email"
              required
              error={errors.email}
              htmlFor="au-email"
              hint="email@emids.com"
            >
              <input
                id="au-email"
                className="input"
                type="text"
                value={draft.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="name@emids.com"
              />
            </Field>
            <Field
              label="Date of joining"
              required
              error={errors.joined_on}
              htmlFor="au-doj"
            >
              <input
                id="au-doj"
                className="input"
                type="date"
                value={draft.joined_on}
                onChange={(e) => set("joined_on", e.target.value)}
              />
            </Field>
          </div>

          <div className="form-row form-row--2">
            <Field label="Directory role" required error={errors.role} as="div">
              <div className="seg" role="group" aria-label="Directory role">
                {(["employee", "manager"] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    className={draft.role === r ? "is-on" : ""}
                    aria-pressed={draft.role === r}
                    onClick={() => set("role", r)}
                  >
                    {r === "employee" ? "Employee" : "Manager"}
                  </button>
                ))}
              </div>
            </Field>
            <Field
              label="Reports to"
              required={draft.role === ROLES.Employee}
              error={errors.manager_id}
              htmlFor="au-manager"
              hint={
                draft.role === ROLES.Manager
                  ? "Managers have no reporting line"
                  : undefined
              }
            >
              <select
                id="au-manager"
                className="select"
                value={draft.manager_id}
                onChange={(e) => set("manager_id", e.target.value)}
                disabled={draft.role === ROLES.Manager}
              >
                <option value="">— Select a manager —</option>
                {managers.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.full_name} · {m.job_title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Starter password"
            required
            error={errors.password}
            htmlFor="au-pwd"
          >
            <div style={{ display: "flex", gap: 8 }}>
              <input
                id="au-pwd"
                className="input"
                type="text"
                value={draft.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Minimum 10 chars · mixed case · digit · symbol"
              />
              <Button
                variant="ghost"
                onClick={() => set("password", suggestPassword())}
                title="Generate a policy-compliant starter password"
              >
                <IconKey size={16} /> Generate
              </Button>
            </div>
          </Field>

          {projected ?? (
            <div className="cred-preview">
              <IconInfo size={14} />{" "}
              <span>
                Pick a date of joining to preview the pro-rated allocation.
              </span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button
            variant="ghost"
            onClick={() => autofill()}
            title="Fill ID, email and password suggestions"
          >
            Autofill suggestions
          </Button>
          <Button type="submit">Review &amp; provision</Button>
        </div>
      </form>

      {confirming && (
        <ConfirmModal
          title="Provision this person?"
          text={`Adds ${draft.full_name || "the new person"} to the directory and provisions ${currentYear} pools pro-rated on date of joining. The starter password is delivered through IT.`}
          confirmLabel="Add & provision"
          busy={busy}
          onConfirm={submit}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  );
}
