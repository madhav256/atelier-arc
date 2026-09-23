import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, date, label, money } from "../lib/api";
import { Field, FormError } from "../components/Form";
import { Loading, ErrorState, Empty } from "../components/States";
import { useAdminList, Pager } from "./ResourceEditor";
import { StaffBid } from "../components/Offers";

const when = (v) => date(v, { dateStyle: "medium", timeStyle: "short" });
const Pill = ({ status }) => (
  <span className={`pill pill-${status}`}>{label(status)}</span>
);
const ORDER_STATUSES = [
  "pending_payment",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "payment_failed",
];
// Mirrors ORDER_TRANSITIONS in backend/src/services/orderService.js.
const NEXT_STATUS = {
  confirmed: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  pending_payment: ["cancelled"],
  payment_failed: ["cancelled"],
};
const PIPELINE = [
  "new",
  "contacted",
  "viewing_scheduled",
  "negotiation",
  "acquired",
  "closed",
];

function Filters({ params, setParam, statuses }) {
  return (
    <div className="admin-filters">
      <Field
        label="Search"
        type="search"
        defaultValue={params.get("q") || ""}
        onChange={(e) => setParam("q", e.target.value)}
      />
      <Field
        label="Status"
        as="select"
        value={params.get("status") || ""}
        onChange={(e) => setParam("status", e.target.value)}
      >
        <option value="">All</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {label(s)}
          </option>
        ))}
      </Field>
    </div>
  );
}

export function OrdersList() {
  const { q, params, setParam, setPage } = useAdminList("orders");
  const rows = q.data?.data || [];
  return (
    <>
      <h1>Orders</h1>
      <Filters params={params} setParam={setParam} statuses={ORDER_STATUSES} />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : rows.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Orders</caption>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Placed</th>
                <th scope="col">Collector</th>
                <th scope="col">Total</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/admin/orders/${o._id}`}>{o.number}</Link>
                  </td>
                  <td>{when(o.createdAt)}</td>
                  <td>{o.email}</td>
                  <td>{money(o.total, o.currency)}</td>
                  <td>
                    <Pill status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No orders match"
          text="Try a different search or status."
        />
      )}
      <Pager meta={q.data?.meta} setPage={setPage} />
    </>
  );
}

export function OrderAdmin({ isAdmin }) {
  const { id } = useParams();
  const qc = useQueryClient();
  const key = ["admin", "orders", "item", id];
  const q = useQuery({
    queryKey: key,
    queryFn: () => api(`/admin/orders/${id}`),
  });
  const [form, setForm] = useState({
    status: "",
    note: "",
    carrier: "",
    number: "",
    url: "",
  });
  const done = (o) => (
    qc.setQueryData(key, o),
    qc.invalidateQueries({ queryKey: ["admin", "orders"] })
  );
  const status = useMutation({
    mutationFn: () =>
      api(`/admin/orders/${id}/status`, {
        body: {
          status: next.includes(form.status) ? form.status : next[0],
          ...(form.note && { note: form.note }),
          ...(form.carrier &&
            form.number && {
              tracking: {
                carrier: form.carrier,
                number: form.number,
                ...(form.url && { url: form.url }),
              },
            }),
        },
      }),
    onSuccess: done,
  });
  const refund = useMutation({
    mutationFn: () =>
      api(`/admin/orders/${id}/refund`, {
        body: { note: "Refund issued by gallery" },
      }),
    onSuccess: done,
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const o = q.data;
  const a = o.shippingAddress || {};
  const paid = ["confirmed", "preparing", "shipped", "delivered"].includes(
    o.status,
  );
  const next = NEXT_STATUS[o.status] || [];
  const chosen = next.includes(form.status) ? form.status : next[0];
  return (
    <>
      <Link to="/admin/orders">← Orders</Link>
      <div className="admin-head">
        <h1>
          {o.number} <Pill status={o.status} />
        </h1>
      </div>
      <div className="admin-columns">
        <section>
          <h2>Items</h2>
          <ul className="row-list">
            {o.items.map((i) => (
              <li key={String(i.artwork)}>
                <span>
                  <b>{i.title}</b> · {i.artistName}
                </span>
                <span>
                  {i.quantity} × {money(i.unitPrice, o.currency)}
                </span>
              </li>
            ))}
          </ul>
          <p>
            Subtotal {money(o.subtotal, o.currency)} · Shipping{" "}
            {money(o.shipping, o.currency)} · Insurance{" "}
            {money(o.insurance, o.currency)} · Tax {money(o.tax, o.currency)} ·{" "}
            <b>Total {money(o.total, o.currency)}</b>
          </p>
          <h2>Collector and delivery</h2>
          <p>
            {o.email}
            <br />
            {label(o.deliveryMethod)}:{" "}
            {[
              a.name,
              a.line1,
              a.line2,
              a.city,
              a.state,
              a.postalCode,
              a.country,
              a.phone,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <h2>Payment</h2>
          <p>
            {o.payment?.provider} · {label(o.payment?.status)}{" "}
            {o.payment?.paidAt && `· paid ${when(o.payment.paidAt)}`}{" "}
            {o.payment?.intentId && <code>{o.payment.intentId}</code>}
          </p>
          <h2>History</h2>
          <ol className="timeline-list">
            {(o.history || []).map((h, i) => (
              <li key={i}>
                <b>{label(h.status)}</b> · {when(h.at)}{" "}
                {h.note && `— ${h.note}`}
              </li>
            ))}
          </ol>
        </section>
        <aside>
          {next.length === 0 ? (
            <div className="admin-card">
              <h2>Fulfilment</h2>
              <p className="muted">
                This order is {label(o.status)}; no further status changes are
                possible.
              </p>
            </div>
          ) : (
            <form
              className="admin-card"
              onSubmit={(e) => {
                e.preventDefault();
                status.mutate(undefined, {
                  onSuccess: () =>
                    setForm({
                      status: "",
                      note: "",
                      carrier: "",
                      number: "",
                      url: "",
                    }),
                });
              }}
            >
              <h2>Update fulfilment</h2>
              <Field
                label="New status"
                as="select"
                value={chosen}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {next.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </Field>
              <Field
                label="Note to collector (optional)"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
              <Field
                label="Carrier"
                value={form.carrier}
                onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              />
              <Field
                label="Tracking number"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
              <Field
                label="Tracking URL"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <FormError error={status.error} />
              <button className="button" disabled={status.isPending}>
                Update order
              </button>
            </form>
          )}
          {isAdmin && paid && (
            <div className="admin-card">
              <h2>Refund</h2>
              <p className="muted">
                Refunds the full amount through {o.payment?.provider} and
                returns the works to inventory.
              </p>
              <FormError error={refund.error} />
              <button
                className="button ghost"
                disabled={refund.isPending}
                onClick={() =>
                  confirm(
                    `Refund ${money(o.total, o.currency)} to ${o.email}?`,
                  ) && refund.mutate()
                }
              >
                Issue full refund
              </button>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

export function InquiriesList({ isAdmin }) {
  const { q, params, setParam, setPage } = useAdminList("inquiries");
  const rows = q.data?.data || [];
  return (
    <>
      <h1>{isAdmin ? "Inquiries" : "My inquiries"}</h1>
      {!isAdmin && <p className="muted">Showing inquiries assigned to you.</p>}
      <nav className="pipeline" aria-label="Pipeline stage">
        {["", ...PIPELINE].map((s) => (
          <button
            key={s || "all"}
            aria-pressed={(params.get("status") || "") === s}
            onClick={() => setParam("status", s)}
          >
            {s ? label(s) : "All"}
          </button>
        ))}
      </nav>
      <Field
        label="Search"
        type="search"
        defaultValue={params.get("q") || ""}
        onChange={(e) => setParam("q", e.target.value)}
      />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : rows.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Inquiries</caption>
            <thead>
              <tr>
                <th scope="col">Reference</th>
                <th scope="col">Collector</th>
                <th scope="col">About</th>
                <th scope="col">Advisor</th>
                <th scope="col">Last activity</th>
                <th scope="col">Stage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => (
                <tr key={i._id}>
                  <td>
                    <Link to={`/admin/inquiries/${i._id}`}>{i.reference}</Link>{" "}
                    {i.priority === "high" && (
                      <span className="pill pill-open">Priority</span>
                    )}
                  </td>
                  <td>
                    {i.name}
                    <br />
                    <small>{i.email}</small>
                  </td>
                  <td>{i.artwork?.title || label(i.type)}</td>
                  <td>{i.advisor?.name || <em>Unassigned</em>}</td>
                  <td>{when(i.lastActivityAt)}</td>
                  <td>
                    <Pill status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty
          title="No inquiries here"
          text="New inquiries from the site appear here."
        />
      )}
      <Pager meta={q.data?.meta} setPage={setPage} />
    </>
  );
}

function PostForm({ labelText, onSubmit, pending, error, button }) {
  const [text, setText] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(text, () => setText(""));
      }}
    >
      <Field
        label={labelText}
        as="textarea"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
        maxLength={4000}
      />
      <FormError error={error} />
      <button className="button small" disabled={pending || !text.trim()}>
        {button}
      </button>
    </form>
  );
}

function useInquiryAction(id, path, onSuccess, method = "POST") {
  return useMutation({
    mutationFn: (body) =>
      api(`/admin/inquiries/${id}/${path}`, { method, body }),
    onSuccess,
  });
}

export function InquiryAdmin({ isAdmin }) {
  const { id } = useParams();
  const qc = useQueryClient();
  const key = ["admin", "inquiries", "item", id];
  const q = useQuery({
    queryKey: key,
    queryFn: () => api(`/admin/inquiries/${id}`),
  });
  const advisors = useQuery({
    queryKey: ["admin", "advisors"],
    queryFn: () => api("/admin/advisors"),
    enabled: isAdmin,
  });
  const done = (i) => (
    qc.setQueryData(key, i),
    qc.invalidateQueries({ queryKey: ["admin", "inquiries"] })
  );
  const status = useInquiryAction(id, "status", done);
  const assign = useInquiryAction(id, "assign", done);
  const note = useInquiryAction(id, "notes", done);
  const reply = useInquiryAction(id, "messages", done);
  const appt = useInquiryAction(id, "appointments", done);
  const offer = useInquiryAction(id, "offer", done);
  const withdraw = useInquiryAction(id, "offer", done, "DELETE");
  const [apptForm, setAppt] = useState({
    startsAt: "",
    mode: "gallery",
    location: "",
  });
  const [offerForm, setOffer] = useState({ amount: "", expiresInDays: 7 });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const i = q.data;
  return (
    <>
      <Link to="/admin/inquiries">← Inquiries</Link>
      <div className="admin-head">
        <h1>
          {i.reference} <Pill status={i.status} />
        </h1>
      </div>
      <div className="admin-columns">
        <section>
          <p>
            <b>{i.name}</b> · <a href={`mailto:${i.email}`}>{i.email}</a>{" "}
            {i.phone && (
              <>
                · <a href={`tel:${i.phone}`}>{i.phone}</a>
              </>
            )}{" "}
            · prefers {i.preferredContact}
            <br />
            {label(i.type)} inquiry{" "}
            {i.artwork && (
              <>
                about{" "}
                <a
                  href={`/artworks/${i.artwork.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {i.artwork.title}
                </a>{" "}
                (
                {i.artwork.priceOnRequest
                  ? "price on request"
                  : money(i.artwork.price, i.artwork.currency)}
                , {i.artwork.availability})
              </>
            )}
            {i.budgetRange && ` · budget ${i.budgetRange}`}
            {i.preferredViewingDate &&
              ` · hopes to view ${date(i.preferredViewingDate)}`}
          </p>
          <h2>Conversation</h2>
          <ol className="messages">
            <li className="from-client">
              <p>{i.message}</p>
              <small>
                {i.name} · {when(i.createdAt)}
              </small>
            </li>
            {i.messages.map((m) => (
              <li key={m._id} className={`from-${m.from}`}>
                <p>{m.text}</p>
                <small>
                  {m.from === "client" ? i.name : m.author?.name || "Advisor"} ·{" "}
                  {when(m.createdAt)}
                </small>
              </li>
            ))}
          </ol>
          <PostForm
            labelText="Reply to collector (they are notified)"
            button="Send reply"
            pending={reply.isPending}
            error={reply.error}
            onSubmit={(text, reset) =>
              reply.mutate({ text }, { onSuccess: reset })
            }
          />
          <h2>Internal notes</h2>
          <ol className="messages">
            {i.notes.map((n) => (
              <li key={n._id} className="from-note">
                <p>{n.text}</p>
                <small>
                  {n.author?.name || "Staff"} · {when(n.createdAt)}
                </small>
              </li>
            ))}
          </ol>
          <PostForm
            labelText="Add a private note (never shown to the collector)"
            button="Add note"
            pending={note.isPending}
            error={note.error}
            onSubmit={(text, reset) =>
              note.mutate({ text }, { onSuccess: reset })
            }
          />
        </section>
        <aside>
          <div className="admin-card">
            <h2>Stage</h2>
            <Field
              label="Pipeline stage"
              as="select"
              value={i.status}
              onChange={(e) => status.mutate({ status: e.target.value })}
            >
              {PIPELINE.map((s) => (
                <option key={s} value={s}>
                  {label(s)}
                </option>
              ))}
            </Field>
            <FormError error={status.error} />
            {isAdmin ? (
              <>
                <Field
                  label="Advisor"
                  as="select"
                  value={i.advisor?._id || ""}
                  onChange={(e) =>
                    e.target.value &&
                    assign.mutate({ advisorId: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {(advisors.data || []).map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name} ({a.role})
                    </option>
                  ))}
                </Field>
                <FormError error={assign.error} />
              </>
            ) : (
              <p>Advisor: {i.advisor?.name || "Unassigned"}</p>
            )}
          </div>
          <form
            className="admin-card"
            onSubmit={(e) => {
              e.preventDefault();
              appt.mutate(
                {
                  mode: apptForm.mode,
                  startsAt: new Date(apptForm.startsAt).toISOString(),
                  ...(apptForm.location && { location: apptForm.location }),
                },
                {
                  onSuccess: () =>
                    setAppt({ startsAt: "", mode: "gallery", location: "" }),
                },
              );
            }}
          >
            <h2>Viewings</h2>
            <ul className="row-list">
              {i.appointments.map((a) => (
                <li key={a._id}>
                  {when(a.startsAt)} · {label(a.mode)}{" "}
                  <Pill status={a.status} />
                </li>
              ))}
            </ul>
            <Field
              label="Proposed time"
              type="datetime-local"
              required
              value={apptForm.startsAt}
              onChange={(e) =>
                setAppt({ ...apptForm, startsAt: e.target.value })
              }
            />
            <Field
              label="Format"
              as="select"
              value={apptForm.mode}
              onChange={(e) => setAppt({ ...apptForm, mode: e.target.value })}
            >
              <option value="gallery">At the gallery</option>
              <option value="virtual">Virtual viewing</option>
              <option value="private">Private (collector's home)</option>
            </Field>
            <Field
              label="Location or link"
              value={apptForm.location}
              onChange={(e) =>
                setAppt({ ...apptForm, location: e.target.value })
              }
            />
            <FormError error={appt.error} />
            <button className="button small" disabled={appt.isPending}>
              Propose viewing
            </button>
          </form>
          {i.bid?.status && <StaffBid inquiry={i} onChange={done} />}
          <form
            className="admin-card"
            onSubmit={(e) => {
              e.preventDefault();
              offer.mutate({
                amount: Number(offerForm.amount),
                expiresInDays: Number(offerForm.expiresInDays),
              });
            }}
          >
            <h2>Private offer</h2>
            {i.offer?.status && (
              <p>
                {money(i.offer.amount, i.offer.currency)} ·{" "}
                <Pill status={i.offer.status} />{" "}
                {i.offer.expiresAt && `· expires ${when(i.offer.expiresAt)}`}
              </p>
            )}
            {i.offer?.status === "open" ? (
              <>
                <FormError error={withdraw.error} />
                <button
                  type="button"
                  className="button ghost small"
                  onClick={() => withdraw.mutate()}
                  disabled={withdraw.isPending}
                >
                  Withdraw offer
                </button>
              </>
            ) : i.artwork ? (
              <>
                <Field
                  label="Amount (INR)"
                  type="number"
                  min="1"
                  required
                  value={offerForm.amount}
                  onChange={(e) =>
                    setOffer({ ...offerForm, amount: e.target.value })
                  }
                />
                <Field
                  label="Valid for (days)"
                  type="number"
                  min="1"
                  max="30"
                  value={offerForm.expiresInDays}
                  onChange={(e) =>
                    setOffer({ ...offerForm, expiresInDays: e.target.value })
                  }
                />
                <FormError error={offer.error} />
                <button className="button small" disabled={offer.isPending}>
                  Send offer
                </button>
              </>
            ) : (
              <p className="muted">
                Offers need an inquiry linked to a specific work.
              </p>
            )}
          </form>
        </aside>
      </div>
    </>
  );
}

export function Dashboard() {
  const q = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: () => api("/admin/analytics"),
  });
  if (q.isLoading) return <Loading />;
  if (q.error) return <ErrorState error={q.error} retry={q.refetch} />;
  const d = q.data;
  const max = Math.max(1, ...d.byMonth.map((m) => m.revenue));
  return (
    <>
      <span className="eyebrow">LAST 12 MONTHS</span>
      <h1>Overview</h1>
      <div className="metrics">
        {[
          ["Revenue", money(d.revenue)],
          ["Paid orders", d.orders],
          ["Average order", money(d.averageOrderValue)],
          ["Open inquiries", d.inquiries.open],
          [
            "Inquiry conversion",
            `${(d.inquiries.conversionRate * 100).toFixed(1)}%`,
          ],
          ["New collectors", d.newCustomers],
        ].map(([k, v]) => (
          <article key={k}>
            <span>{k}</span>
            <b>{v}</b>
          </article>
        ))}
      </div>
      <section className="admin-card">
        <h2>Revenue by month</h2>
        {d.byMonth.length ? (
          <table className="bar-chart">
            <caption className="sr-only">Revenue by month</caption>
            <tbody>
              {d.byMonth.map((m) => (
                <tr key={m._id}>
                  <th scope="row">{m._id}</th>
                  <td>
                    <span
                      className="bar"
                      style={{ width: `${(m.revenue / max) * 100}%` }}
                    />
                    {money(m.revenue)} · {m.orders} orders
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No paid orders yet.</p>
        )}
      </section>
      <div className="admin-columns three">
        <section className="admin-card">
          <h2>Inquiry pipeline</h2>
          <dl className="totals">
            {PIPELINE.map((s) => (
              <FragmentRow
                key={s}
                k={label(s)}
                v={d.inquiries.byStatus[s] || 0}
              />
            ))}
          </dl>
        </section>
        <section className="admin-card">
          <h2>Inventory</h2>
          <dl className="totals">
            {Object.entries(d.inventory).map(([k, v]) => (
              <FragmentRow
                key={k}
                k={label(k)}
                v={`${v.count} · ${money(v.value)}`}
              />
            ))}
          </dl>
        </section>
        <section className="admin-card">
          <h2>Most viewed</h2>
          <ol>
            {d.topViewed.map((a) => (
              <li key={a._id}>
                <Link to={`/admin/artworks/${a._id}`}>{a.title}</Link> ·{" "}
                {a.viewCount} views · {a.saveCount} saves
              </li>
            ))}
          </ol>
        </section>
      </div>
      <section className="admin-card">
        <h2>Recent orders</h2>
        <ul className="row-list">
          {d.recentOrders.map((o) => (
            <li key={o._id}>
              <Link to={`/admin/orders/${o._id}`}>
                <b>{o.number}</b>
                <span>{o.email}</span>
                <span>{money(o.total, o.currency)}</span>
                <Pill status={o.status} />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

const FragmentRow = ({ k, v }) => (
  <>
    <dt>{k}</dt>
    <dd>{v}</dd>
  </>
);

export function AuditLog() {
  const { q, setPage } = useAdminList("audit");
  const rows = q.data?.data || [];
  const meta = q.data?.meta && {
    ...q.data.meta,
    pages: Math.ceil(q.data.meta.total / q.data.meta.limit),
  };
  return (
    <>
      <h1>Audit log</h1>
      <p className="muted">
        Every staff change is recorded here and cannot be edited or deleted.
      </p>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Audit log</caption>
            <thead>
              <tr>
                <th scope="col">When</th>
                <th scope="col">Who</th>
                <th scope="col">Action</th>
                <th scope="col">Item</th>
                <th scope="col">Changes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>{when(r.createdAt)}</td>
                  <td>{r.actorEmail}</td>
                  <td>{r.action}</td>
                  <td>
                    {r.resource}{" "}
                    <code>{String(r.resourceId || "").slice(-8)}</code>
                  </td>
                  <td>
                    <details>
                      <summary>View</summary>
                      <pre>{JSON.stringify(r.changes, null, 2)}</pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pager meta={meta} setPage={setPage} />
    </>
  );
}
