import {
  draftToUser,
  empNoIssue,
  emailIssue,
  managerIssue,
  passwordIssue,
  validateDraft,
} from "../src/features/users/validateUser";
import type { DirectoryUser } from "../src/types/models";

const existing: DirectoryUser = {
  user_id: "u1",
  emp_no: "EMP-1001",
  full_name: "Ada Lovelace",
  email: "ada.lovelace@emids.com",
  role: "employee",
  status: "Active",
  job_title: "Engineer",
  manager_id: "u-m1",
  joined_on: "2024-01-10",
  added_on: "2024-01-10",
  password_set: true,
};

describe("password policy", () => {
  it("rejects short and single-class passwords", () => {
    expect(passwordIssue("short")).toBeTruthy();
    expect(passwordIssue("alllowercase1!")).toBeTruthy(); // no upper
    expect(passwordIssue("ALLUPPERCASE1!")).toBeTruthy(); // no lower
    expect(passwordIssue("NoDigitsHere!")).toBeTruthy();
    expect(passwordIssue("NoSpecial123Bravo")).toBeTruthy();
  });

  it("accepts a strong starter password", () => {
    expect(passwordIssue("Breeze-42!x")).toBeNull();
  });
});

describe("directory uniqueness", () => {
  it("flags a duplicate employee number and email", () => {
    expect(empNoIssue("EMP-1001", [existing])).toBe("Already in the directory");
    expect(empNoIssue("EMP-10011", [existing])).toBeTruthy();
    expect(emailIssue("ADA.LOVELACE@emids.com", [existing])).toBe(
      "Already in the directory",
    );
    expect(emailIssue("not-an-email", [existing])).toBeTruthy();
  });
});

describe("draft validation", () => {
  const base = {
    full_name: "Kabir Tiwari",
    email: "kabir.tiwari@emids.com",
    emp_no: "EMP-2002",
    role: "employee" as const,
    job_title: "Data Engineer",
    manager_id: "u-m1",
    joined_on: "2026-06-14",
    password: "Breeze-42!x",
  };

  it("passes a complete draft", () => {
    expect(Object.keys(validateDraft(base, [existing]))).toHaveLength(0);
  });

  it("demands a reporting manager for employees only", () => {
    expect(managerIssue("employee", "")).toBeTruthy();
    expect(managerIssue("manager", "")).toBeNull();
  });

  it("maps missing fields to error keys", () => {
    const errors = validateDraft(
      { ...base, full_name: "", joined_on: "", password: "short" },
      [],
    );
    expect(Object.keys(errors).sort()).toEqual([
      "full_name",
      "joined_on",
      "password",
    ]);
  });

  it("normalizes the email on save", () => {
    const user = draftToUser({ ...base, email: "  Kabir.T@emids.COM " });
    expect(user.email).toBe("kabir.t@emids.com");
    expect(user.password_set).toBe(true);
  });
});
