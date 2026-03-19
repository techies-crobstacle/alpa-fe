"use client";

import { useState, useCallback, useContext, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ReceiptText,
  CheckCircle2,
  Clock,
  CircleCheck,
  XCircle,
  AlertCircle,
  ArrowRight,
  ImagePlus,
  X,
  Package,
} from "lucide-react";
import { toast } from "react-toastify";
import { AuthContext } from "@/context/AuthContext";

// ─── Constants ───────────────────────────────────────────────────────────────

const BASE_URL = "https://alpa-be.onrender.com";

const STATUS_STEPS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

type RefundStatus = (typeof STATUS_STEPS)[number];

// ─── Types ───────────────────────────────────────────────────────────────────

interface RefundTicket {
  id: string;
  orderId: string;
  requestType: "refund" | "partial_refund";
  reason: string;
  status: RefundStatus;
  priority: string;
  adminResponse: string | null;
  createdAt: string;
  updatedAt: string;
  guestEmail: string;
}

interface OrderItem {
  quantity: number;
  price: string;
  product: {
    id: string;
    featuredImage: string;
    title: string;
    images: string[];
  };
}

interface FetchedOrder {
  id: string;
  displayId?: string;
  status: string;
  totalAmount: string;
  customerName: string;
  items: OrderItem[];
  createdAt: string;
}

interface SelectedItem {
  productId: string;
  title: string;
  quantity: number;
  maxQuantity: number;
}

interface UploadedImage {
  previewUrl: string;
  url: string | null;
  uploading: boolean;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusBadge(status: string): { bg: string; text: string; label: string } {
  switch (status) {
    case "OPEN":
      return { bg: "bg-blue-100", text: "text-blue-700", label: "Open" };
    case "IN_PROGRESS":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "In Progress" };
    case "RESOLVED":
      return { bg: "bg-green-100", text: "text-green-700", label: "Resolved" };
    case "CLOSED":
      return { bg: "bg-gray-100", text: "text-gray-500", label: "Closed" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-500", label: status };
  }
}

function requestTypeLabel(type: string): string {
  return type === "refund" ? "Full Refund" : "Partial Refund";
}

// ─── Status Stepper ──────────────────────────────────────────────────────────

function StatusStepper({ status }: { status: string }) {
  const currentIndex = STATUS_STEPS.indexOf(status as RefundStatus);

  const icons = [
    <Clock key="OPEN" className="w-4 h-4" />,
    <Loader2 key="IN_PROGRESS" className="w-4 h-4" />,
    <CircleCheck key="RESOLVED" className="w-4 h-4" />,
    <XCircle key="CLOSED" className="w-4 h-4" />,
  ];

  const labels = ["Open", "In Progress", "Resolved", "Closed"];

  return (
    <div className="mt-4">
      <div className="flex items-center">
        {STATUS_STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isActive = i === currentIndex;
          const isFuture = i > currentIndex;
          return (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-[#5A1E12] text-white"
                      : isActive
                      ? "bg-[#5A1E12] text-[#ead7b7] ring-2 ring-[#5A1E12]/30 ring-offset-2"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    icons[i]
                  )}
                </div>
                <span
                  className={`mt-1 text-[10px] font-semibold whitespace-nowrap ${
                    isFuture ? "text-gray-400" : "text-[#5A1E12]"
                  }`}
                >
                  {labels[i]}
                </span>
              </div>
              {/* Connector */}
              {i < STATUS_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-4 rounded-full transition-all ${
                    i < currentIndex ? "bg-[#5A1E12]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Request Card ─────────────────────────────────────────────────────────────

interface RequestCardProps {
  ticket: RefundTicket;
  orderId: string;
  email: string;
}

function RequestCard({ ticket, orderId, email }: RequestCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<RefundTicket | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const badge = statusBadge(ticket.status);

  const handleExpand = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    if (detail) return;
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/guest/refund-requests/${ticket.id}?orderId=${encodeURIComponent(orderId)}&customerEmail=${encodeURIComponent(email)}`
      );
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to load details."); return; }
      setDetail(data);
    } catch {
      toast.error("Failed to load details. Please try again.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const displayed = detail ?? ticket;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      {/* Card Header — always visible */}
      <button
        onClick={handleExpand}
        className="w-full px-5 py-4 flex items-start justify-between gap-4 text-left hover:bg-gray-50/60 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#5A1E12]/60 truncate">#{ticket.id.slice(-10)}</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
              {requestTypeLabel(ticket.requestType)}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{ticket.reason}</p>
          <p className="text-xs text-gray-400 mt-1.5">Submitted {formatDate(ticket.createdAt)}</p>
        </div>
        <div className="shrink-0 mt-1 text-gray-400">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {loadingDetail ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-[#5A1E12]/40" />
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <StatusStepper status={displayed.status} />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Ticket ID</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{displayed.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Last Updated</p>
                  <p className="text-sm text-gray-700">{formatDate(displayed.updatedAt)}</p>
                </div>
              </div>

              {/* Admin Response */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Admin Response</p>
                <p className="text-sm text-gray-700">
                  {displayed.adminResponse ?? (
                    <span className="text-gray-400 italic">Awaiting review</span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Cloudinary upload helper ─────────────────────────────────────────────────
// Requires NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local
async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Image uploads are not configured. Please contact support.");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Image upload failed.");
  return data.secure_url as string;
}

const BLOCKED_STATUSES = ["CANCELLED", "REFUND", "PARTIAL_REFUND"];

// ─── Submit Tab ───────────────────────────────────────────────────────────────

interface SubmitTabProps {
  onSuccess: (ticketId: string, submittedOrderId: string) => void;
}

function SubmitTab({ onSuccess }: SubmitTabProps) {
  const auth = useContext(AuthContext);
  const isLoggedIn = !!auth?.user && !!auth?.token;

  // Step: "lookup" → verify order first, then "form" to fill details
  const [step, setStep] = useState<"lookup" | "form">("lookup");

  // Lookup fields
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState(auth?.user?.email ?? "");
  const [isLooking, setIsLooking] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<FetchedOrder | null>(null);

  // Item selection — keyed by productId
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});

  // Form fields
  const [requestType, setRequestType] = useState<"refund" | "partial_refund">("refund");
  const [reason, setReason] = useState("");

  // Image upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ ticketId: string; orderId: string } | null>(null);

  // ── Lookup order ──────────────────────────────────────────────────────────────
  const handleLookup = async () => {
    if (!orderId.trim()) { toast.error("Please enter your Order ID."); return; }
    if (!email.trim()) { toast.error("Please enter your email address."); return; }
    setIsLooking(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/guest/track?orderId=${encodeURIComponent(orderId.trim())}&customerEmail=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Order not found. Please check your details."); return; }
      setFetchedOrder(data);
      // Pre-select all items at their full quantity
      const init: Record<string, SelectedItem> = {};
      (data.items ?? []).forEach((item: OrderItem) => {
        const pid = item.product?.id;
        if (pid) {
          init[pid] = { productId: pid, title: item.product.title, quantity: item.quantity, maxQuantity: item.quantity };
        }
      });
      setSelectedItems(init);
      setStep("form");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLooking(false);
    }
  };

  // ── Image upload ──────────────────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (images.length + files.length > 5) {
      toast.error("You can attach a maximum of 5 images.");
      return;
    }
    // Add placeholders immediately so the user sees upload progress
    const startIdx = images.length;
    const placeholders: UploadedImage[] = files.map((f) => ({
      previewUrl: URL.createObjectURL(f),
      url: null,
      uploading: true,
    }));
    setImages((prev) => [...prev, ...placeholders]);
    files.forEach((file, i) => {
      const idx = startIdx + i;
      uploadImageToCloudinary(file)
        .then((url) => {
          setImages((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], url, uploading: false };
            return next;
          });
        })
        .catch((err: Error) => {
          setImages((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], uploading: false, error: err.message };
            return next;
          });
          toast.error(`Upload failed: ${err.message}`);
        });
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const next = [...prev];
      URL.revokeObjectURL(next[idx].previewUrl);
      next.splice(idx, 1);
      return next;
    });
  };

  const resetForm = () => {
    setStep("lookup");
    setOrderId("");
    setEmail(auth?.user?.email ?? "");
    setFetchedOrder(null);
    setSelectedItems({});
    setReason("");
    setRequestType("refund");
    setImages((prev) => { prev.forEach((img) => URL.revokeObjectURL(img.previewUrl)); return []; });
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { toast.error("Please provide a reason for the refund."); return; }
    if (images.some((img) => img.uploading)) { toast.error("Please wait for all images to finish uploading."); return; }
    if (images.some((img) => img.error)) { toast.error("Some images failed to upload. Please remove them before submitting."); return; }

    const itemsPayload = Object.values(selectedItems).map(({ productId, title, quantity }) => ({ productId, title, quantity }));
    const imagesPayload = images.filter((img) => img.url).map((img) => img.url as string);

    setIsSubmitting(true);
    try {
      let res: Response;
      if (isLoggedIn && auth?.token) {
        // Registered user — authenticated endpoint
        res = await fetch(`${BASE_URL}/api/orders/refund-request/${encodeURIComponent(orderId.trim())}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${auth.token}` },
          body: JSON.stringify({ requestType, reason: reason.trim(), items: itemsPayload, images: imagesPayload }),
        });
      } else {
        // Guest — no auth required
        res = await fetch(`${BASE_URL}/api/orders/guest/refund-request`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId.trim(),
            customerEmail: email.trim(),
            requestType,
            reason: reason.trim(),
            items: itemsPayload,
            images: imagesPayload,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) { toast.error(data.message || "Failed to submit request."); return; }
      setSuccessInfo({ ticketId: data.requestId, orderId: orderId.trim() });
      resetForm();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────────
  if (successInfo) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 mb-1">Your request has been submitted.</p>
              <p className="text-sm text-green-700 mb-3">
                Ticket ID: <span className="font-mono font-semibold break-all">{successInfo.ticketId}</span>
              </p>
              <button
                onClick={() => { onSuccess(successInfo.ticketId, successInfo.orderId); setSuccessInfo(null); }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-900 transition-colors"
              >
                Track It <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setSuccessInfo(null)}
          className="text-sm text-[#5A1E12]/60 hover:text-[#5A1E12] transition-colors"
        >
          + Submit another request
        </button>
      </div>
    );
  }

  // ── Step: Lookup ──────────────────────────────────────────────────────────────
  if (step === "lookup") {
    return (
      <div className="space-y-5">
        {isLoggedIn && auth?.user && (
          <div className="flex items-center gap-2 bg-[#5A1E12]/5 border border-[#5A1E12]/10 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-[#5A1E12] shrink-0" />
            <p className="text-sm text-[#5A1E12]">
              Signed in as <strong>{auth.user.name}</strong> — your email is pre-filled.
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Order ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="e.g. ORD-123456"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { if (!isLoggedIn) setEmail(e.target.value); }}
            readOnly={isLoggedIn}
            placeholder="The email used at checkout"
            className={`w-full border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all ${
              isLoggedIn ? "bg-gray-50 text-gray-400 cursor-default" : "text-gray-800"
            }`}
          />
        </div>

        <button
          onClick={handleLookup}
          disabled={isLooking}
          className="w-full py-3.5 bg-[#5A1E12] text-[#ead7b7] font-bold rounded-xl hover:bg-[#4a1810] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
        >
          {isLooking ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Looking up order…</>
          ) : (
            <><Search className="w-4 h-4" /> Find My Order</>
          )}
        </button>
      </div>
    );
  }

  // ── Step: Form (items + details) ──────────────────────────────────────────────
  const isBlocked = !!fetchedOrder && BLOCKED_STATUSES.includes(fetchedOrder.status.toUpperCase());

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Back to lookup */}
      <button
        type="button"
        onClick={() => setStep("lookup")}
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors -mb-1"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Change order
      </button>

      {/* Order summary card */}
      <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
        <Package className="w-5 h-5 text-[#5A1E12] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Order #{fetchedOrder?.displayId ?? orderId}</p>
          {fetchedOrder?.customerName && (
            <p className="text-xs text-gray-500 mt-0.5">{fetchedOrder.customerName}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{fetchedOrder?.items?.length ?? 0} item(s)</p>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
            isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {fetchedOrder?.status}
        </span>
      </div>

      {/* Blocked status notice */}
      {isBlocked ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">Refund not available</p>
            <p className="text-xs text-red-600 mt-0.5">
              This order is in <strong>{fetchedOrder?.status}</strong> status and cannot be submitted for a refund.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Item selection ── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
              Select Items to Return
            </label>
            {(fetchedOrder?.items ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No items found for this order.</p>
            ) : (
              <div className="space-y-2">
                {(fetchedOrder?.items ?? []).map((item) => {
                  const pid = item.product?.id;
                  if (!pid) return null;
                  const isChecked = !!selectedItems[pid];
                  const imgSrc = item.product?.featuredImage || item.product?.images?.[0];
                  return (
                    <div
                      key={pid}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                        isChecked
                          ? "border-[#5A1E12]/30 bg-[#5A1E12]/5"
                          : "border-gray-200 bg-white hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedItems((prev) => {
                          const next = { ...prev };
                          if (next[pid]) {
                            delete next[pid];
                          } else {
                            next[pid] = { productId: pid, title: item.product.title, quantity: item.quantity, maxQuantity: item.quantity };
                          }
                          return next;
                        });
                      }}
                    >
                      {/* Custom checkbox */}
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                          isChecked ? "bg-[#5A1E12] border-[#5A1E12]" : "border-gray-300 bg-white"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>

                      {/* Product image */}
                      {imgSrc && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                          <Image
                            src={imgSrc}
                            alt={item.product.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Name + price */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.product.title}</p>
                        <p className="text-xs text-gray-400">{item.quantity}× @ {item.price}</p>
                      </div>

                      {/* Quantity stepper (only when checked) */}
                      {isChecked && (
                        <div
                          className="flex items-center gap-1.5 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => {
                                const cur = prev[pid];
                                if (!cur || cur.quantity <= 1) return prev;
                                return { ...prev, [pid]: { ...cur, quantity: cur.quantity - 1 } };
                              })
                            }
                            className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-gray-800">
                            {selectedItems[pid].quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedItems((prev) => {
                                const cur = prev[pid];
                                if (!cur || cur.quantity >= cur.maxQuantity) return prev;
                                return { ...prev, [pid]: { ...cur, quantity: cur.quantity + 1 } };
                              })
                            }
                            className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300 flex items-center justify-center transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Request Type ── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Request Type <span className="text-red-400">*</span>
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as "refund" | "partial_refund")}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-white focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all appearance-none cursor-pointer"
            >
              <option value="refund">Full Refund</option>
              <option value="partial_refund">Partial Refund</option>
            </select>
          </div>

          {/* ── Reason ── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Describe why you are requesting a refund…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all resize-none"
            />
          </div>

          {/* ── Evidence Images ── */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1">
              Evidence Images{" "}
              <span className="normal-case font-normal text-gray-400">(optional, max 5)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Attach photos of damaged/incorrect items to speed up your request.</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                >
                  <Image src={img.previewUrl} alt="evidence" fill className="object-cover" />
                  {img.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  {img.error && (
                    <div className="absolute inset-0 bg-red-500/80 flex flex-col items-center justify-center gap-1 px-1">
                      <AlertCircle className="w-4 h-4 text-white" />
                      <span className="text-[9px] text-white text-center leading-tight">Failed</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#5A1E12]/40 hover:text-[#5A1E12]/60 transition-all"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="text-[10px] font-semibold">Add photo</span>
                </button>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={isSubmitting || images.some((img) => img.uploading)}
            className="w-full py-3.5 bg-[#5A1E12] text-[#ead7b7] font-bold rounded-xl hover:bg-[#4a1810] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            ) : (
              <><ReceiptText className="w-4 h-4" /> Submit Refund Request</>
            )}
          </button>
        </>
      )}
    </form>
  );
}

// ─── Track Tab ────────────────────────────────────────────────────────────────

interface TrackTabProps {
  prefillOrderId?: string;
}

function TrackTab({ prefillOrderId = "" }: TrackTabProps) {
  const [orderId, setOrderId] = useState(prefillOrderId);
  const [email, setEmail] = useState("");
  const [tickets, setTickets] = useState<RefundTicket[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!orderId.trim() || !email.trim()) {
      toast.error("Please enter both Order ID and Email.");
      return;
    }
    setIsSearching(true);
    setSearched(false);
    try {
      const res = await fetch(
        `${BASE_URL}/api/orders/guest/refund-requests?orderId=${encodeURIComponent(orderId.trim())}&customerEmail=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Failed to fetch requests.");
        setTickets(null);
        return;
      }
      setTickets(Array.isArray(data) ? data : []);
      setSearched(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, [orderId, email]);

  return (
    <div className="space-y-5">
      {/* Search fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Order ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. A4X9KR"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Email Address <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="guest@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-[#5A1E12]/40 focus:ring-2 focus:ring-[#5A1E12]/10 transition-all"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        disabled={isSearching}
        className="w-full py-3.5 bg-[#5A1E12] text-[#ead7b7] font-bold rounded-xl hover:bg-[#4a1810] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
      >
        {isSearching ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Searching…</>
        ) : (
          <><Search className="w-4 h-4" /> Find Requests</>
        )}
      </button>

      {/* Skeleton loader */}
      {isSearching && (
        <div className="space-y-3 mt-2">
          {[1, 2].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results */}
      {!isSearching && searched && tickets !== null && (
        <>
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No refund requests found for this order.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium">
                {tickets.length} request{tickets.length > 1 ? "s" : ""} found
              </p>
              {tickets.map((ticket) => (
                <RequestCard
                  key={ticket.id}
                  ticket={ticket}
                  orderId={orderId}
                  email={email}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GuestRefundPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "track">("submit");
  const [trackPrefillId, setTrackPrefillId] = useState("");
  // Bump key to force TrackTab to re-mount with fresh prefill
  const [trackKey, setTrackKey] = useState(0);

  const handleSubmitSuccess = (ticketId: string, submittedOrderId: string) => {
    setTrackPrefillId(submittedOrderId);
    setTrackKey((k) => k + 1);
    setActiveTab("track");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">

      {/* ─── Top bar ─────────────────────────────────────────────────── */}
      <header className="bg-[#5A1E12] px-5 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#ead7b7]/70 hover:text-[#ead7b7] text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex-1" />
        {/* <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#ead7b7]/15 flex items-center justify-center">
            <ReceiptText className="w-4 h-4 text-[#ead7b7]" />
          </div>
          <span className="text-[#ead7b7]/80 text-sm font-semibold hidden sm:block">
            Guest Refund Portal
          </span>
        </div> */}
      </header>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#5A1E12] leading-tight">
              Refund Requests
            </h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Submit a new refund request or track an existing one using your Order ID and email.
            </p>
            
            {/* Important Information */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Important Information
              </h3>
              <div className="text-xs text-blue-800 space-y-1.5">
                <p><strong>What you'll need:</strong> Your Order ID and the email address used at checkout.</p>
                <p><strong>Processing time:</strong> Refund requests are typically reviewed within 2-3 business days.</p>
                <p><strong>Refund timeline:</strong> Once approved, refunds are processed back to your original payment method within 5-10 business days.</p>
                <p><strong>Eligible items:</strong> Items must be in original condition and returned within 30 days of purchase (excluding personalized or custom items).</p>
              </div>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6">
            <button
              onClick={() => setActiveTab("submit")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "submit"
                  ? "bg-white text-[#5A1E12] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Submit Request
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                activeTab === "track"
                  ? "bg-white text-[#5A1E12] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Track Requests
            </button>
          </div>

          {/* Tab content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {activeTab === "submit" ? (
              <SubmitTab onSuccess={handleSubmitSuccess} />
            ) : (
              <TrackTab key={trackKey} prefillOrderId={trackPrefillId} />
            )}
          </div>

        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="py-6 text-center">
        <p className="text-sm text-gray-400">
          Have an account?{" "}
          <Link href="/login" className="text-[#5A1E12] font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </footer>
    </div>
  );
}
