import { useNavigate } from "react-router-dom";
import { useAdmin } from "../store/AdminContext";
import { PageHead } from "../components/ui";
import { AddUserForm } from "../components/feature/add-user/AddUserForm";
import { draftToUser, type UserDraft } from "../features/users/validateUser";
import {
  currentYear,
  proRataAllocationFor,
} from "../features/balances/provisioning";
import { fmtDays } from "../utils/format";
import type { BalanceRow } from "../types/models";

export default function AddUser() {
  const { users, provisionBalance, addDirectoryUser, setToast } = useAdmin();
  const navigate = useNavigate();

  // Organism owns the draft + validation; the page owns persistence + routing.
  const submitDraft = async (draft: UserDraft): Promise<boolean> => {
    const { user } = await addDirectoryUser(draftToUser(draft));
    if (!user) return false;
    const { annualCredited, contingencyCredited } = proRataAllocationFor(
      user.joined_on,
      currentYear(),
    );
    const row: BalanceRow = {
      user_id: user.user_id,
      year: currentYear(),
      annualCredited,
      carriedForward: 0,
      annualUsed: 0,
      contingencyCredited,
      contingencyUsed: 0,
      compOffTaken: 0,
      generated_by: "add-user",
    };
    await provisionBalance(row);
    setToast(
      `${user.full_name} added · ${fmtDays(annualCredited)} d annual provisioned for ${draft.joined_on}.`,
    );
    navigate("/dashboard");
    return true;
  };

  return (
    <div className="page">
      <PageHead
        eyebrow="Administration · Directory"
        title="Provision a new person"
      >
        Add a person to the directory, hand them a starter credential and
        provision the allocation year in one pass.
      </PageHead>

      <AddUserForm
        users={users}
        onSubmit={submitDraft}
        onError={(msg) => setToast(msg, "red")}
      />
    </div>
  );
}
