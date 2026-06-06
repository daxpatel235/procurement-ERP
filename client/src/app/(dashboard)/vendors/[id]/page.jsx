"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, FileText, Star, ShoppingCart, Receipt, Loader2 } from "lucide-react";
import { vendorsApi } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { formatINR, formatDate } from "@/lib/format";
import { PageHeader, Card, Badge, PrimaryButton, GhostButton, EmptyState } from "@/components/ui/kit";

export default function VendorDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => vendorsApi.get(id), [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center gap-2 py-24 text-slate-400">
        <Loader2 size={18} className="animate-spin" /> Loading vendor...
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/vendors" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4">
          <ArrowLeft size={16} /> Back to vendors
        </Link>
        <Card className="p-6">
          <EmptyState icon={FileText} title="Vendor not found" hint={error?.message || `No vendor with id ${id}`} />
        </Card>
      </div>
    );
  }

  const vendor = data.data;
  const pos = data.purchaseOrders || [];
  const invs = data.invoices || [];

  return (
    <div className="max-w-5xl mx-auto">
      <Link href="/vendors" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft size={16} /> Back to vendors
      </Link>

      <PageHeader title={vendor.name} subtitle={`${vendor.id} · ${vendor.category}`}>
        <GhostButton href={`/rfqs/new?vendor=${vendor.id}`}>
          <FileText size={16} /> Invite to RFQ
        </GhostButton>
        <Link href={`/purchase-orders/new?vendor=${vendor.id}`}>
          <PrimaryButton>
            <ShoppingCart size={16} /> Create PO
          </PrimaryButton>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-bold text-lg">
              {vendor.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <div>
              <Badge status={vendor.status} />
              <p className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                <Star size={14} className="text-amber-400 fill-amber-400" /> {vendor.rating} rating
              </p>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <Info icon={Mail} label="Email" value={vendor.email} />
            <Info icon={Phone} label="Phone" value={vendor.phone} />
            <Info icon={MapPin} label="Location" value={vendor.location} />
            <Info icon={FileText} label="GSTIN" value={vendor.gstin} />
          </dl>
        </Card>

        {/* Stats + history */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Total Orders" value={vendor.orders} icon={ShoppingCart} />
            <Stat label="Total Spend" value={formatINR(vendor.spend)} icon={Receipt} />
          </div>

          <Card>
            <SectionTitle title="Purchase Orders" />
            <HistoryTable rows={pos} type="po" />
          </Card>

          <Card>
            <SectionTitle title="Invoices" />
            <HistoryTable rows={invs} type="invoice" />
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="text-slate-400 mt-0.5" />
      <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-slate-800 font-medium">{value}</dd>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <Icon size={18} className="text-blue-600 mb-3" />
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function SectionTitle({ title }) {
  return <h2 className="text-base font-bold text-slate-900 px-6 py-4 border-b border-slate-100">{title}</h2>;
}

function HistoryTable({ rows, type }) {
  if (!rows.length) return <div className="px-6 py-8 text-sm text-slate-400 text-center">No records yet.</div>;
  return (
    <div className="divide-y divide-slate-100">
      {rows.map((r) => (
        <Link
          key={r.id}
          href={type === "po" ? `/purchase-orders/${r.id}` : `/invoices/${r.id}`}
          className="flex items-center justify-between px-6 py-3.5 hover:bg-slate-50 transition"
        >
          <div>
            <p className="text-sm font-semibold text-slate-900">{r.id}</p>
            <p className="text-xs text-slate-400">{formatDate(r.created || r.issued)}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-900">{formatINR(r.amount)}</span>
            <Badge status={r.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
