// Run with: pnpm test (node:test; Node strips the TypeScript types on import)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolvePlaceId, withPlace } from "./place-url.ts";

const known = new Set(["aea17b7", "aa8275b"]);

test("resolvePlaceId accepts a known id", () => {
  assert.equal(resolvePlaceId("aea17b7", known), "aea17b7");
  assert.equal(resolvePlaceId(" aa8275b ", known), "aa8275b");
});

test("resolvePlaceId ignores unknown, empty and missing values", () => {
  assert.equal(resolvePlaceId("nope", known), null);
  assert.equal(resolvePlaceId("", known), null);
  assert.equal(resolvePlaceId(undefined, known), null);
  assert.equal(resolvePlaceId(null, known), null);
  assert.equal(resolvePlaceId("__proto__", known), null);
});

test("resolvePlaceId uses the first value of a repeated param", () => {
  assert.equal(resolvePlaceId(["aa8275b", "aea17b7"], known), "aa8275b");
  assert.equal(resolvePlaceId([], known), null);
});

test("withPlace sets, replaces and removes the param", () => {
  assert.equal(withPlace("/", "aea17b7"), "/?place=aea17b7");
  assert.equal(withPlace("/?place=aa8275b", "aea17b7"), "/?place=aea17b7");
  assert.equal(withPlace("/?place=aa8275b", null), "/");
  assert.equal(withPlace("/?x=1&place=aa8275b#h", null), "/?x=1#h");
});
