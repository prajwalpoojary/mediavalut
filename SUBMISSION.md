# Submission

Keep this tight. Bullet points are fine. We read this before we read your code,
and a clear account of your reasoning carries real weight — including where you
chose not to do something.

## Video walkthrough

Paste your Loom (or equivalent) link here. 5–10 minutes.

**Link:**

---

## How to run it

Anything we need to know beyond `npm install && npm run dev`.

## Time spent

Roughly, and how you split it.

---

## Baseline defects found

| # | Defect | Where | Fixed / left / out of scope |
| --- | --- | --- | --- |
| 1 | No request identity: an older `GET /api/assets` response can resolve after a newer one and overwrite its state, since the effect only compares whether `JSON.stringify(query)` changed, not which request was issued last | `useAssets.ts` | Fixed — generation counter in a useRef, compared at response time (live read) against the request's own snapshot (captured at send time), so a superseded request can never win regardless of arrival order |
| 2 | Every keystroke fires a request with no debounce, so a 6-character query can send 6 requests and burn through the 80-req/10s budget fast | `useAssets.ts` (caller in `App.tsx`) | Fixed — useDebouncedValue (300ms) sits between the raw input and the query passed into useAssets; the input itself still updates every keystroke, only the fetch is delayed |
| 3 | No `AbortController` anywhere in the fetch layer — outdated in-flight requests are never cancelled, just ignored once their response lands | `client.ts` | Left |
| 4 | Bulk update sends every selected id in one call; the API caps bulk-status at 50 ids and returns `400 too_many_ids` above that | `App.tsx` (`applyBulkStatus`) | Left |
| 5 | List and detail panel are disconnected copies of the same server row: saving a status change in `AssetDetail` never updates the grid behind it (`handleSaved` is a no-op) | `App.tsx` (`handleSaved`) | Left |
| 6 | Grid is not keyboard-reachable at all — cards only respond to `onClick`/checkbox `onChange`, no `tabIndex`, no arrow-key or Enter/Space handling | `AssetGrid.tsx` | Left |
| 7 | Toggling one card's selection re-renders the entire list — no memoization, no stable prop references, `selectedIds` passed as a single `Set` that changes identity on every toggle | `AssetGrid.tsx` | Left |
| 8 | Query state (`q`, `status`, `sort`) lives only in component `useState` — a reload loses the current view, the URL can't be shared, and there's no pagination cursor to invalidate yet when filters change | `App.tsx` | Left |

---

## Key decisions

For each significant choice: what you did, what you rejected, and why. Three to
six of these is about right.

**Data fetching and caching**

**Stale response handling**

**Virtualization approach**

**Optimistic updates and rollback**

**Retry and backoff policy**

**State placement and URL sync**

`q`, `status`, and `sort` live in the URL (`URLSearchParams`), read on mount
and restored on `popstate`. React `useState` stays the source of truth for
interaction (controlled inputs need a synchronous value on every keystroke);
the URL is a one-way mirror written via `history.replaceState` on every
change, so reload/copy-link/share restores the same view.
 
Rejected: React Router's `useSearchParams`. This is a single-page app with
no other routes — pulling in a router purely for URL sync would cost bundle
size (tracked as a submission metric) for ~50 lines of functionality already
hand-rollable with `URLSearchParams` + a `popstate` listener, which I can
fully explain line-by-line.
 
`replaceState` (never `pushState`) was a deliberate choice to satisfy the
literal requirement — "filter changes should not stack up as one history
entry per keystroke" — without spamming browser history. Known limitation:
see Trade-offs and cuts.

---

## Performance

Fill in real measurements, not estimates. Say which machine and browser.

| Metric | Before | After | How measured |
| --- | --- | --- | --- |
| Rendered DOM nodes at 5,000 rows loaded | | | |
| Cards re-rendered when toggling one selection | | | |
| Longest task during sustained scroll | | | |
| Requests fired while typing a 6-character query | | | |
| Production bundle, gzipped | | | |

What was the actual bottleneck, and how did you find it?

---

## Accessibility

- Keyboard model you implemented, in one paragraph.
- How you tested it, including any screen reader.
- Known gaps.

---

## Interface decisions

Three or four sentences: what you were optimising for, and the decisions that
follow from it. Then briefly:

- **Visual system.** Your colour, spacing and type decisions, and where they live.
- **Status treatment.** How the four statuses read as a progression, and how they
  stay distinguishable without relying on colour.
- **States.** What you did with loading, empty, error, offline and partial
  failure.
- **Contrast.** What you checked against, and with what.
- **Copy.** Any user-facing message you rewrote and why.

Screenshots in the repo are welcome — link them here.

---

## Trade-offs and cuts

What you deliberately did not do, and what you would do with another day.

- **URL history granularity.** Filter/search changes always use
  `history.replaceState`, including meaningful selections (e.g. toggling a
  status filter), not just keystrokes. This satisfies the literal
  requirement (no entry per keystroke) but means Back/Forward exits the
  filtered view in one step rather than stepping back through individual
  filter changes, the way a real search UI (Gmail, e-commerce filters)
  typically behaves. With another day: debounce the *history commit*
  separately from the URL *write* — keep `replaceState` while a filter is
  actively changing, fire one `pushState` once it settles (reusing the same
  debounce pattern already used for the search fetch).

## Critique of the API

What you would change about the backend contract, and what it forced you to do in
the client that you would rather not have.

## Anything you would like us to look at

Code you are proud of, or a decision you are unsure about and want to discuss.
