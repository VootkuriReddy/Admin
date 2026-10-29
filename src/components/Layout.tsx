import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "../store/AdminContext";
import { useDismiss } from "../hooks/useDismiss";
import { IconButton } from "./ui";
import ProfileMenu from "./layout/ProfileMenu";
import NotificationsPanel from "./layout/NotificationsPanel";
import {
  IconMenu,
  IconBell,
  IconX,
  IconLogout,
  IconChevronDown,
  IconUser,
  IconKey,
  IconDashboard,
  IconUserPlus,
  IconRefresh,
  IconPaperPlane,
} from "./Icons";
import type { IconComponent } from "./Icons";

import logo from "../assets/emids-logo.svg";

export interface NavItem {
  to: string;
  num: string;
  label: string;
  icon: IconComponent;
}

export const NAV: NavItem[] = [
  { to: "/dashboard", num: "1", label: "Control centre", icon: IconDashboard },
  {
    to: "/add-user",
    num: "2",
    label: "New Directory Entry",
    icon: IconUserPlus,
  },
  { to: "/credentials", num: "3", label: "Credential Desk", icon: IconKey },
  { to: "/year-end", num: "4", label: "Year-End Rollover", icon: IconRefresh },
  {
    to: "/reminders",
    num: "5",
    label: "Manager Reminders",
    icon: IconPaperPlane,
  },
];

export interface LayoutProps {
  children: ReactNode;
}

const EMPTY_NOTICES: never[] = [];

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { signOut, operator, notices, leaves, users, pwdRequests } = useAdmin();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  useDismiss(drawerRef, { onClose: () => setOpen(false), enabled: open });

  // Outbox indicator: unread nudges since the last open, per operator id.
  const seenKey = "admin-outbox-seen";
  const unreadCount =
    notices.length - Number(window.sessionStorage.getItem(seenKey) ?? 0);

  const markSeen = useCallback(() => {
    try {
      window.sessionStorage.setItem(seenKey, String(notices.length));
    } catch {
      // private-mode storage failure: the badge just reappears
    }
  }, [seenKey, notices.length]);

  // keep the count sane across rows changing under us
  const shownUnread = Math.max(0, Math.min(unreadCount, notices.length));

  useEffect(() => {
    if (notifOpen) markSeen();
  }, [notifOpen, markSeen]);

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const weekday = new Date().toLocaleDateString("en-GB", { weekday: "long" });

  const goto = (to: string) => {
    navigate(to);
    setOpen(false);
    setProfileOpen(false);
  };
  const logout = async () => {
    if (!(await signOut())) return;
    setOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const pendingLeaves = Array.isArray(leaves)
    ? leaves.filter((r) => r.status === "Pending").length
    : 0;
  const openPwdRequests = Array.isArray(pwdRequests)
    ? pwdRequests.filter((r) => r.status === "Open").length
    : 0;
  const noticeList = Array.isArray(notices) ? notices : EMPTY_NOTICES;

  return (
    <div className="shell">
      <div className="topbar" />

      <header className="header">
        <IconButton label="Menu" onClick={() => setOpen(true)}>
          <IconMenu size={22} />
        </IconButton>

        <button
          className="header__logo"
          aria-label="Emids admin home"
          onClick={() => goto("/dashboard")}
        >
          <img src={logo} alt="Emids" />
        </button>

        <div className="header__title">Admin Console</div>

        <div className="header__right">
          <IconButton
            label={
              unreadCount > 0 ? `Outbox log (${shownUnread} new)` : "Outbox log"
            }
            title="Outbox log"
            aria-haspopup="dialog"
            aria-expanded={notifOpen}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <IconBell size={21} />
            {shownUnread > 0 && (
              <span className="icon-btn__count" aria-hidden="true">
                {shownUnread > 9 ? "9+" : shownUnread}
              </span>
            )}
          </IconButton>
          <IconButton
            label={profileOpen ? "Hide my profile" : "Show my profile"}
            className={`header__profile${profileOpen ? " is-open" : ""}`}
            aria-haspopup="dialog"
            aria-expanded={profileOpen}
            title="My profile"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <IconUser size={23} />
            <IconChevronDown size={13} />
          </IconButton>
        </div>

        {profileOpen && operator && (
          <ProfileMenu
            operator={operator}
            onDismiss={() => setProfileOpen(false)}
          />
        )}
        {notifOpen && (
          <NotificationsPanel
            notices={noticeList}
            onDismiss={() => setNotifOpen(false)}
          />
        )}
      </header>

      <main className="content">{children}</main>

      {open && <div className="drawer-backdrop" aria-hidden="true" />}
      <div
        className="drawer"
        ref={drawerRef}
        style={
          open
            ? {}
            : {
                transform: "translateX(-100%)",
                visibility: "hidden",
                transition:
                  "transform 240ms var(--ease-resolve), visibility 0s 240ms",
              }
        }
      >
        <div className="drawer__topbar" />

        <div className="drawer__profile">
          <span className="avatar">{operator?.initials}</span>
          <div>
            <div className="drawer__name">{operator?.name}</div>
            <div className="drawer__role">{operator?.job_title} · admin</div>
          </div>
          <IconButton label="Close menu" onClick={() => setOpen(false)}>
            <IconX size={19} />
          </IconButton>
        </div>

        <div className="drawer__counts">
          <div className="drawer__count">
            <b>{Array.isArray(users) ? users.length : 0}</b>
            <span>People</span>
          </div>
          <div className="drawer__count">
            <b>{pendingLeaves}</b>
            <span>Pending leave</span>
          </div>
        </div>

        <nav className="drawer__nav">
          {NAV.map(({ to, num, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className="nav-item"
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span className="mono">{num}</span>
              <span className="nav-item__label">{label}</span>
              {to === "/credentials" && openPwdRequests > 0 && (
                <span
                  className="nav-item__badge"
                  title={`${openPwdRequests} forgotten-password report${openPwdRequests > 1 ? "s" : ""} waiting`}
                >
                  {openPwdRequests}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="drawer__foot">
          <div className="drawer__date">
            <span>
              <b>TODAY</b> · {weekday}
            </span>
            <span>{today}</span>
          </div>
          <button className="btn btn--ghost btn--logout" onClick={logout}>
            <IconLogout size={15} /> Log out
          </button>
        </div>
      </div>
    </div>
  );
}
