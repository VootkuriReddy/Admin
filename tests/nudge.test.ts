import {
  buildNudgeQueue,
  draftNudgeText,
} from "../src/features/notifications/nudge";
import type { DirectoryUser, LeaveRequest } from "../src/types/models";

const manager = (id: string, name: string): DirectoryUser => ({
  user_id: id,
  emp_no: "EMP-1111",
  full_name: name,
  email: `${id}@emids.com`,
  role: "manager",
  status: "Active",
  job_title: "Delivery Manager",
  manager_id: null,
  joined_on: "2019-01-07",
  added_on: "2019-01-07",
  password_set: true,
});

const person = (id: string, managerId: string): DirectoryUser => ({
  user_id: id,
  emp_no: "EMP-2222",
  full_name: `Person ${id}`,
  email: `${id}@emids.com`,
  role: "employee",
  status: "Active",
  job_title: "Engineer",
  manager_id: managerId,
  joined_on: "2024-03-01",
  added_on: "2024-03-01",
  password_set: true,
});

const leave = (
  req: string,
  userId: string,
  submitted: string,
): LeaveRequest => ({
  request_no: req,
  user_id: userId,
  leave_type: "Annual",
  from: "2026-11-09",
  to: "2026-11-13",
  days: 10,
  status: "Pending",
  submitted_on: submitted,
});

describe("manager nudge queue", () => {
  it("groups pending requests under the reporting manager, busiest first", () => {
    const users = [
      manager("m1", "Rohan Fernandes"),
      manager("m2", "Meera Bhatt"),
      person("e1", "m1"),
      person("e2", "m2"),
    ];
    const leaves = [
      leave("LR-1", "e1", "2026-10-24"),
      leave("LR-2", "e1", "2026-10-26"),
      leave("LR-3", "e2", "2026-10-20"),
    ];
    const queue = buildNudgeQueue(users, leaves);
    expect(queue).toHaveLength(2);
    expect(queue[0]!.manager.user_id).toBe("m1");
    expect(queue[0]!.requests).toHaveLength(2);
    expect(queue[0]!.oldestSubmitted).toBe("2026-10-24");
  });

  it("ignores decided requests and teamless people", () => {
    const users = [
      manager("m1", "Alpha"),
      person("e1", "m1"),
      person("e3", ""),
    ];
    const leaves = [
      leave("LR-4", "e1", "2026-10-24"),
      { ...leave("LR-5", "e1", "2026-10-24"), status: "Approved" as const },
      leave("LR-6", "e3", "2026-10-24"),
    ];
    expect(buildNudgeQueue(users, leaves)).toHaveLength(1);
  });

  it("drafts a single-recipient copy naming the oldest request", () => {
    const users = [manager("m1", "Rohan Fernandes"), person("e1", "m1")];
    const copy = draftNudgeText(
      buildNudgeQueue(users, [leave("LR-1", "e1", "2026-10-24")]),
    );
    expect(copy.subject).toContain("1 pending leave request");
    expect(copy.message).toContain("Rohan");
    expect(copy.message).toContain("LR-1");
  });

  it("drafts a broadcast copy across several managers", () => {
    const users = [
      manager("m1", "Alpha"),
      manager("m2", "Beta"),
      person("e1", "m1"),
      person("e2", "m2"),
    ];
    const copy = draftNudgeText(
      buildNudgeQueue(users, [
        leave("LR-1", "e1", "2026-10-24"),
        leave("LR-2", "e2", "2026-10-25"),
      ]),
    );
    expect(copy.subject).toContain("2 request");
  });
});
