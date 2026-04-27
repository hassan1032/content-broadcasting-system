import assert from "node:assert/strict";
import test from "node:test";
import { selectActiveContent } from "../src/services/schedulingService.js";

const start = new Date("2026-04-26T10:00:00.000Z");
const end = new Date("2026-04-26T11:00:00.000Z");

function item(id, subject, order, duration) {
  return {
    id,
    subject,
    rotation_order: order,
    duration_minutes: duration,
    start_time: start,
    end_time: end,
  };
}

test("selects the first item at the start of a subject cycle", () => {
  const active = selectActiveContent(
    [item(1, "maths", 1, 5), item(2, "maths", 2, 5), item(3, "maths", 3, 5)],
    new Date("2026-04-26T10:03:00.000Z"),
  );

  assert.equal(active.id, 1);
});

test("rotates to the next item based on elapsed duration", () => {
  const active = selectActiveContent(
    [item(1, "maths", 1, 5), item(2, "maths", 2, 5), item(3, "maths", 3, 5)],
    new Date("2026-04-26T10:07:00.000Z"),
  );

  assert.equal(active.id, 2);
});

test("loops continuously after the full cycle completes", () => {
  const active = selectActiveContent(
    [item(1, "maths", 1, 5), item(2, "maths", 2, 5), item(3, "maths", 3, 5)],
    new Date("2026-04-26T10:17:00.000Z"),
  );

  assert.equal(active.id, 1);
});

test("rotates each subject independently", () => {
  const active = selectActiveContent(
    [
      item(1, "maths", 1, 5),
      item(2, "maths", 2, 5),
      item(3, "science", 1, 10),
      item(4, "science", 2, 10),
    ],
    new Date("2026-04-26T10:07:00.000Z"),
  );

  assert.deepEqual(
    active.map((entry) => entry.id),
    [2, 3],
  );
});
