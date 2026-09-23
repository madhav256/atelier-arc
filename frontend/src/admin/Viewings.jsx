import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, label } from "../lib/api";
import { FormError } from "../components/Form";
import { Loading, ErrorState, Empty } from "../components/States";
import { viewingWhen } from "../pages/Viewings";

const PLACE = {
  mumbai: "Mumbai",
  "new-delhi": "New Delhi",
  virtual: "Virtual",
};

export function ViewingsAdmin() {
  const [upcoming, setUpcoming] = useState(true);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["admin", "viewings", upcoming],
    queryFn: () => api(`/admin/viewings?upcoming=${upcoming}`),
  });
  const set = useMutation({
    mutationFn: ({ id, status }) =>
      api(`/admin/viewings/${id}/status`, { body: { status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "viewings"] }),
  });
  return (
    <>
      <h1>Viewings</h1>
      <div className="filters">
        <label className="switch">
          <input
            type="checkbox"
            checked={upcoming}
            onChange={(e) => setUpcoming(e.target.checked)}
          />{" "}
          Upcoming only
        </label>
      </div>
      <FormError error={set.error} />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorState error={q.error} retry={q.refetch} />
      ) : q.data.length ? (
        <div className="table-wrap">
          <table className="data-table">
            <caption className="sr-only">Private viewings</caption>
            <thead>
              <tr>
                <th scope="col">When (IST)</th>
                <th scope="col">Where</th>
                <th scope="col">Collector</th>
                <th scope="col">Work</th>
                <th scope="col">Notes</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((v) => (
                <tr key={v._id}>
                  <td>
                    {viewingWhen(v.startsAt)}
                    <br />
                    <small>{v.reference}</small>
                  </td>
                  <td>{PLACE[v.location]}</td>
                  <td>
                    {v.name}
                    <br />
                    <small>{v.email}</small>
                  </td>
                  <td>
                    {v.artwork ? (
                      <Link to={`/artworks/${v.artwork.slug}`}>
                        {v.artwork.title}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>{v.notes || ""}</td>
                  <td>
                    <span className={`pill pill-${v.status}`}>
                      {label(v.status)}
                    </span>
                  </td>
                  <td className="viewing-row-actions">
                    {v.status === "confirmed" &&
                      [
                        ["completed", "Completed"],
                        ["no_show", "No-show"],
                        ["cancelled", "Cancel"],
                      ].map(([status, text]) => (
                        <button
                          key={status}
                          type="button"
                          className="text-button"
                          disabled={set.isPending}
                          onClick={() => set.mutate({ id: v._id, status })}
                          aria-label={`${text}: ${v.reference}`}
                        >
                          {text}
                        </button>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No viewings" text="Booked viewings appear here." />
      )}
    </>
  );
}
