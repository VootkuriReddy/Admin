import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../store/AdminContext";
import { Button, Field } from "../components/ui";
import logoLight from "../assets/emids-logo-light.svg";

const FEATURES = [
  {
    num: "1",
    title: "Provision in one pass",
    text: "Add a person, set their starter password and let the solver split pools by date of joining.",
  },
  {
    num: "2",
    title: "Balances that stay honest",
    text: "Run the year-end rollover with a capped carry-forward and a clean, inspectable trail.",
  },
  {
    num: "3",
    title: "Queues that never stall",
    text: "See which managers are sitting on pending time-off, and nudge them without leaving the console.",
  },
];

export default function Login() {
  const { signIn, signedIn } = useAdmin();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (signedIn) navigate("/dashboard", { replace: true });
  }, [signedIn, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const message = await signIn(id.trim(), password, remember);
      if (message) setError(message);
    } catch (thrown) {
      setError(
        thrown instanceof Error
          ? thrown.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <section className="login__brand">
        <div>
          <img className="login__logo" src={logoLight} alt="Emids" />
          <div className="login__plate">Administrator Control Plane</div>
        </div>

        <div>
          <h1 className="login__headline">
            The directory, steered <em>from one desk.</em>
          </h1>
          <div className="login__features">
            {FEATURES.map((f, i) => (
              <div
                className={`login__feature ${i === 0 ? "login__feature--accent" : ""}`}
                key={f.num}
              >
                <div>
                  <span className="mono">
                    {i + 1}/03 · {f.num}
                  </span>
                  <b>{f.title}</b>
                  <span>{f.text}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="login__plate-foot">
            <span>EMIDS · OPERATOR SUITE</span>
          </div>
        </div>
      </section>

      <section className="login__form-side">
        <div className="login__form">
          <span className="eyebrow">Administration Sign-in</span>
          <h1>Operator access.</h1>
          <p className="login__lede">
            This console is for directory operators. Enter your operator id and
            password — access is provisioned and rotated by Emids IT.
          </p>

          <form className="login__fields" onSubmit={handleSubmit}>
            <Field label="Operator Username" required htmlFor="login-id">
              <input
                id="login-id"
                className="input"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="admin"
                autoComplete="username"
                required
              />
            </Field>
            <Field
              label="Password"
              required
              error={error}
              htmlFor="login-password"
            >
              <input
                id="login-password"
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            <label
              className="form-label"
              style={{
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 12.5,
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: "var(--teal)" }}
              />
              Keep this terminal signed in after the window closes
            </label>
            <Button
              className="btn--sso"
              type="submit"
              busy={busy}
              busyLabel="Checking operator key"
            >
              Sign in to console
            </Button>
          </form>

          <p className="login__note">
            Authorised operators only · all changes are audit-logged
            <br />
            Access trouble? raise it at helpdesk.emids.com
          </p>
        </div>
      </section>
    </div>
  );
}
