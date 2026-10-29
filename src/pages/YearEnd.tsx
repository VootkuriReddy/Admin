import { useAdmin } from "../store/AdminContext";
import { PageHead } from "../components/ui";
import { RolloverDesk } from "../components/feature/year-end/RolloverDesk";
import { allRuns } from "../features/balances/yearEndRuns";
import { IconRefresh } from "../components/Icons";

export default function YearEnd() {
  const { users, balances, runYearEnd, setToast } = useAdmin();

  // Organism owns the year picker, plan math and confirm modal;
  // the page owns persistence via the store.
  const executeRun = async (
    nextRows: Parameters<typeof runYearEnd>[0],
    fromYear: number,
  ) => {
    const res = await runYearEnd(nextRows, fromYear);
    if (res.error) {
      setToast(res.error, "red");
      return;
    }
    setToast(
      "Year-end rollout applied — new allocation year opened with capped carry-forward.",
    );
  };

  return (
    <div className="page">
      <PageHead eyebrow="Administration · Year End" title="Close the year">
        Close the allocation year: full fresh pools for the next year, leftover
        annual banked as carry-forward up to the policy cap, contingency and
        comp-off reset.
      </PageHead>

      <div className="strip-note">
        <IconRefresh size={18} />
        <div>
          <b>How the rollout runs</b>
          Every active person with a source row gets a next-year row: 24 d
          annual + banked carry-forward (max 10 d) + 10 d contingency, zero
          take-up. Inactive people and missing rows are skipped, and the
          previous year's rows stay on file for audit.
        </div>
      </div>

      <RolloverDesk
        users={users}
        balances={balances}
        runs={allRuns()}
        onExecute={executeRun}
      />
    </div>
  );
}
