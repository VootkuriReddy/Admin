import { useRef, type ReactNode } from "react";
import { useAdmin } from "../../store/AdminContext";
import { useDismiss } from "../../hooks/useDismiss";
import { IconLogout } from "../Icons";
import type { Operator } from "../../types/models";

export interface ProfileMenuProps {
  operator: Operator;
  onDismiss: () => void;
}

export default function ProfileMenu({
  operator,
  onDismiss,
}: ProfileMenuProps): ReactNode {
  const { signOut } = useAdmin();
  const ref = useRef<HTMLDivElement | null>(null);
  useDismiss(ref, { onClose: onDismiss });

  const logout = async () => {
    onDismiss();
    if (await signOut()) window.location.assign("/login");
  };

  return (
    <div
      ref={ref}
      className="profile-pop"
      role="dialog"
      aria-label="My profile"
    >
      <div className="pop-bar" />
      <div className="profile-pop__who">
        <span className="avatar">{operator.initials}</span>
        <div>
          <div className="profile-pop__name">{operator.name}</div>
        </div>
      </div>
      <div className="profile-pop__fields">
        <div>
          <span className="drawer__role">System access</span>
          <div className="profile-pop__name" style={{ fontSize: 13.5 }}>
            Operator · admin
          </div>
        </div>
        <div>
          <span className="drawer__role">Scope</span>
          <div className="profile-pop__name" style={{ fontSize: 13.5 }}>
            Directory + balances
          </div>
        </div>
      </div>
      <div style={{ padding: "0 20px 20px" }}>
        <button className="btn btn--ghost btn--logout" onClick={logout}>
          <IconLogout size={15} /> Log out
        </button>
      </div>
    </div>
  );
}
