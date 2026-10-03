import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Mic, Plus, Search, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";
import { deleteInspection, getInspections, getMediaUrl } from "../services/api";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useLanguageStore } from "../store/themeStore";
import { translations } from "../i18n/translations";
import TableScrollContainer from "../components/common/TableScrollContainer";

const statusBadge = {
  open: "badge-medium",
  in_progress: "badge-high",
  closed: "badge-low",
  escalated: "badge-critical",
};

const severityBadge = {
  low: "badge-low",
  medium: "badge-medium",
  high: "badge-high",
  critical: "badge-critical",
};

export default function Inspections() {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", severity: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [photoZoom, setPhotoZoom] = useState(1);
  const { language } = useLanguageStore();
  const t = translations[language];
  const adjustPhotoZoom = (amount) => {
    setPhotoZoom((current) => Math.min(4, Math.max(1, current + amount)));
  };
  const filteredInspections = inspections.filter((inspection) =>
    inspection.title?.toLocaleLowerCase().includes(searchQuery.trim().toLocaleLowerCase()),
  );

  useEffect(() => {
    fetchInspections();
  }, [filters]);

  useEffect(() => {
    if (selectedPhotos.length === 0) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (selectedPhoto) setSelectedPhoto(null);
        else setSelectedPhotos([]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, selectedPhotos.length]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.severity) params.severity = filters.severity;
      const res = await getInspections(params);
      setInspections(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInspection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inspection?"))
      return;

    try {
      await deleteInspection(id);
      toast.success("Inspection deleted successfully");
      setInspections((prev) =>
        prev.filter((inspection) => inspection._id !== id),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete inspection",
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f3eadb] px-4 pb-10 pt-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex flex-col items-center text-center gap-4 border-b border-[#c9b69d] pb-4 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <h1 className="text-3xl sm:text-[40px] font-medium tracking-[-0.05em] text-[#1b1b1b] dark:text-white">
            {t.inspections}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
            <label className="relative min-w-[220px] flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#786f63]" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={language === "hi" ? "निरीक्षण का नाम खोजें" : "Search inspection name"}
                aria-label={language === "hi" ? "निरीक्षण का नाम खोजें" : "Search inspection name"}
                className="w-full rounded-full border border-[#bca98e] bg-[#f8f4ed] py-2.5 pl-10 pr-4 text-[16px] text-[#1f1f1f] outline-none placeholder:text-[#786f63] focus:border-[#8a7156] sm:w-64"
              />
            </label>
            <select
              id="inspection-status-filter"
              name="status"
              aria-label={t.allStatus}
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="min-w-[160px] appearance-none rounded-full border border-[#bca98e] bg-[#f8f4ed] px-4 py-2.5 pr-10 text-[16px] text-[#1f1f1f] outline-none focus:border-[#8a7156]"
            >
              <option value="">{t.allStatus}</option>
              <option value="open">{t.open}</option>
              <option value="in_progress">{t.inProgress}</option>
              <option value="closed">{t.closed}</option>
              <option value="escalated">{t.escalated}</option>
            </select>

            <select
              id="inspection-severity-filter"
              name="severity"
              aria-label={t.allSeverity}
              value={filters.severity}
              onChange={(e) =>
                setFilters({ ...filters, severity: e.target.value })
              }
              className="min-w-[160px] appearance-none rounded-full border border-[#bca98e] bg-[#f8f4ed] px-4 py-2.5 pr-10 text-[16px] text-[#1f1f1f] outline-none focus:border-[#8a7156]"
            >
              <option value="">{t.allSeverity}</option>
              <option value="low">{t.low}</option>
              <option value="medium">{t.medium}</option>
              <option value="high">{t.high}</option>
              <option value="critical">{t.criticalLabel}</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-[#d8c6a6] bg-[#f5efe8] shadow-[0_2px_8px_rgba(76,60,43,0.08)]">
          <TableScrollContainer>
            <table className="mobile-readable-table text-[15px] text-[#1d1d1d]">
              <thead className="bg-[#f1e8dc] text-left">
                <tr>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    {t.title}
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    Photos
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    {t.mine}
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    {t.severity}
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    {t.status}
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    {t.risk}
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    {t.date}
                  </th>
                  <th className="px-4 py-4 font-semibold text-[#1e1e1e]">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-12 text-center text-slate-400"
                    >
                      {t.loading}
                    </td>
                  </tr>
                ) : filteredInspections.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-12 text-center text-slate-400"
                    >
                      {searchQuery.trim()
                        ? language === "hi"
                          ? "इस नाम से कोई निरीक्षण नहीं मिला।"
                          : "No inspections match that name."
                        : t.noInspections}
                    </td>
                  </tr>
                ) : (
                  filteredInspections.map((insp) => {
                    const audioUrl = getMediaUrl(insp.audio);

                    return (
                      <tr
                        key={insp._id}
                        className="border-t border-[#d7c8b0] bg-[#f7f3ed] hover:bg-[#f1eadf]"
                      >
                        <td className="px-4 py-4 align-middle max-w-sm">
                          <Link
                            to={`/app/inspections/${insp._id}`}
                            className="text-[17px] font-semibold text-[#1f1f1f] hover:text-[#0d3f6d] hover:underline block"
                          >
                            {insp.title}
                          </Link>
                          {insp.description ? (
                            <p className="mt-1 text-xs text-[#52493b] dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {insp.description}
                            </p>
                          ) : insp.observations ? (
                            <p className="mt-1 text-xs text-slate-400 italic line-clamp-1">
                              {insp.observations}
                            </p>
                          ) : null}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <div className="flex items-center gap-3">
                            {audioUrl ? (
                              <div className="flex items-center gap-2 rounded-full bg-[#f0f1f3] px-2 py-1 text-[10px] font-medium text-[#3a3a3a]">
                                <Mic className="h-3 w-3 text-[#0d3f6d]" />
                                <audio
                                  controls
                                  src={audioUrl}
                                  className="h-8 w-28"
                                  onError={(event) => {
                                    event.currentTarget.parentElement.style.display =
                                      "none";
                                  }}
                                />
                              </div>
                            ) : null}

                            {insp.photos?.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const photos = insp.photos.map(getMediaUrl);
                                    setSelectedPhotos(photos);
                                    setSelectedPhotoIndex(0);
                                    setSelectedPhoto(null);
                                    setPhotoZoom(1);
                                  }}
                                  className="group relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-[#d9c7a7] shadow-sm"
                                  aria-label="Open inspection photos"
                                >
                                  <img
                                    src={getMediaUrl(insp.photos[0])}
                                    alt="Inspection preview"
                                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
                                    onError={(event) => {
                                      event.currentTarget.closest("button").style.display = "none";
                                    }}
                                  />
                                </button>
                                {insp.photos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const photos = insp.photos.map(getMediaUrl);
                                      setSelectedPhotos(photos);
                                      setSelectedPhotoIndex(0);
                                      setSelectedPhoto(null);
                                      setPhotoZoom(1);
                                    }}
                                    className="inline-flex h-8 min-w-8 items-center justify-center gap-0.5 rounded-md bg-[#ece4d5] px-2 text-xs font-semibold text-[#4c433d] transition hover:bg-[#ded0bb]"
                                    aria-label={`Open ${insp.photos.length} inspection photos`}
                                    title={`Open ${insp.photos.length} photos`}
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                    <span>{insp.photos.length - 1}</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs">—</span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle text-[#2d2d2d]">
                          {insp.mineId?.name || "—"}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${severityBadge[insp.severity]}`}
                          >
                            {insp.severity}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[12px] font-medium capitalize ${statusBadge[insp.status]}`}
                            >
                              {insp.status?.replace("_", " ")}
                            </span>
                            {insp.status === "closed" && insp.photos?.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300" title="Closed with photo proof">
                                <CheckCircle className="h-4 w-4" aria-hidden="true" /> Proof
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4 align-middle text-center font-semibold text-[#1e1e1e]">
                          {insp.riskScore}
                        </td>

                        <td className="px-4 py-4 align-middle text-[#474747]">
                          {insp.createdAt
                            ? format(new Date(insp.createdAt), "dd MMM yyyy")
                            : "—"}
                        </td>

                        <td className="px-4 py-4 align-middle">
                          <button
                            type="button"
                            onClick={() => handleDeleteInspection(insp._id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </TableScrollContainer>

          <div className="flex justify-end px-4 pb-4 pt-2">
            <Link
              to="/app/inspections/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0d3f6d] px-5 py-3 text-[15px] font-medium text-white shadow-[0_3px_10px_rgba(13,63,109,0.25)] transition hover:bg-[#0a3560]"
            >
              <Plus className="h-4 w-4" />
              {t.newInspection}
            </Link>
          </div>
        </div>

        {selectedPhotos.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/85 p-3 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Inspection photo gallery"
            onClick={() => {
              setSelectedPhoto(null);
              setSelectedPhotos([]);
            }}
          >
            <div
              className="flex max-h-[80vh] w-[min(1100px,90vw)] flex-col overflow-hidden rounded-xl bg-slate-900 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3 text-white">
                {selectedPhoto ? (
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(null)}
                    className="rounded-md px-2 py-1 text-sm transition hover:bg-white/10"
                  >
                    Back to photos
                  </button>
                ) : (
                  <span className="text-sm font-medium">Inspection photos</span>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-300">
                    {selectedPhoto ? `${selectedPhotoIndex + 1} / ` : ""}{selectedPhotos.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPhoto(null);
                      setSelectedPhotos([]);
                    }}
                    className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
                    aria-label="Close photo gallery"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {selectedPhoto ? (
                <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-4">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-800 p-1 text-white">
                    <button
                      type="button"
                      onClick={() => adjustPhotoZoom(-0.25)}
                      disabled={photoZoom <= 1}
                      className="rounded p-2 transition hover:bg-white/15 disabled:opacity-40"
                      aria-label="Zoom out"
                    >
                      <ZoomOut className="h-5 w-5" />
                    </button>
                    <span className="min-w-12 text-center text-sm tabular-nums">
                      {Math.round(photoZoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => adjustPhotoZoom(0.25)}
                      disabled={photoZoom >= 4}
                      className="rounded p-2 transition hover:bg-white/15 disabled:opacity-40"
                      aria-label="Zoom in"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                  </div>
                  {selectedPhotos.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIndex = (selectedPhotoIndex - 1 + selectedPhotos.length) % selectedPhotos.length;
                          setSelectedPhotoIndex(nextIndex);
                          setSelectedPhoto(selectedPhotos[nextIndex]);
                          setPhotoZoom(1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-xl text-white transition hover:bg-white/20"
                        aria-label="Previous photo"
                      >
                        &#8249;
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const nextIndex = (selectedPhotoIndex + 1) % selectedPhotos.length;
                          setSelectedPhotoIndex(nextIndex);
                          setSelectedPhoto(selectedPhotos[nextIndex]);
                          setPhotoZoom(1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-xl text-white transition hover:bg-white/20"
                        aria-label="Next photo"
                      >
                        &#8250;
                      </button>
                    </>
                  )}
                  <img
                    src={selectedPhoto}
                    alt="Enlarged inspection site"
                    className="max-h-[65vh] max-w-[80vw] rounded-lg object-contain shadow-2xl transition-transform duration-150"
                    style={{ transform: `scale(${photoZoom})` }}
                    onWheel={(event) => {
                      event.preventDefault();
                      adjustPhotoZoom(event.deltaY < 0 ? 0.25 : -0.25);
                    }}
                  />
                </div>
              ) : (
                <div className="grid min-h-0 grid-cols-2 gap-3 overflow-y-auto p-3">
                  {selectedPhotos.map((photo, index) => (
                    <button
                      key={`${photo}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedPhotoIndex(index);
                        setSelectedPhoto(photo);
                        setPhotoZoom(1);
                      }}
                      className="group h-[min(28vh,250px)] overflow-hidden rounded-lg border border-white/10 bg-slate-800"
                      aria-label={`View inspection photo ${index + 1}`}
                    >
                      <img
                        src={photo}
                        alt={`Inspection photo ${index + 1}`}
                        className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.03]"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
