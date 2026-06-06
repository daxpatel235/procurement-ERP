"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, Send, IndianRupee, Building2, Calendar, Receipt, FileText, Loader2 } from "lucide-react";
import { invoicesApi } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { formatINR, formatDate } from "@/lib/format";
import { PageHeader, Card, Badge, PrimaryButton, GhostButton, EmptyState } from "@/components/ui/kit";

const GST_RATE = 0.18;

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(() => invoicesApi.get(id), [id]);
  const inv = data?.data;
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (inv) setStatus(inv.status);
  }, [inv]);

  const markPaid = async () => {
    setBusy(true);
    try {
      const res = await invoicesApi.pay(id); // full payment
      setStatus(res.data.status);
    } catch (e) {
      alert(e.message || "Could not record payment.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 py-24 text-slate-400">
        <Loader2 size={18} className="animate-spin" /> Loading invoice...
      </div>
    );
  }

  if (error || !inv) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link href="/invoices" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4"><ArrowLeft size={16} /> Back</Link>
        <Card className="p-6"><EmptyState icon={Receipt} title="Invoice not found" hint={error?.message || `No invoice with id ${id}`} /></Card>
      </div>
    );
  }

  const subtotal = inv.items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/invoices" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 mb-4"><ArrowLeft size={16} /> Back to invoices</Link>

      <PageHeader title={inv.id} subtitle={`Billed to ${inv.vendor}`}>
        <Badge status={status} />
        <GhostButton href={`/invoices/${inv.id}/print`}><Printer size={16} /> Print</GhostButton>
        <GhostButton href={`/invoices/${inv.id}/send`}><Send size={16} /> Send</GhostButton>
        {status !== "Paid" && status !== "Cancelled" && (
          <PrimaryButton onClick={markPaid}>
            {busy ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><IndianRupee size={16} /> Mark paid</>}
          </PrimaryButton>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-base font-bold text-slate-900 px-6 py-4 border-b border-slate-100">Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-slate-500 uppercase border-b border-slate-100">
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Unit price</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inv.items.map((it, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3.5 font-medium text-slate-800">{it.name}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">{it.qty}</td>
                      <td className="px-6 py-3.5 text-right text-slate-600">{formatINR(it.unitPrice)}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-slate-900">{formatINR(it.qty * it.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatINR(subtotal)}</span></div>
              <div className="flex justify-between text-slate-600"><span>GST (18%)</span><span>{formatINR(gst)}</span></div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-bold"><span className="text-slate-700">Total</span><span className="text-lg text-blue-600">{formatINR(total)}</span></div>
            </div>
          </Card>
        </div>

        <Card className="p-6 h-fit space-y-4">
          <Meta icon={Building2} label="Vendor" value={inv.vendor} href={inv.vendorId ? `/vendors/${inv.vendorId}` : null} />
          {inv.poId && <Meta icon={FileText} label="Linked PO" value={inv.poId} href={`/purchase-orders/${inv.poId}`} />}
          <Meta icon={Calendar} label="Issued" value={formatDate(inv.issued)} />
          <Meta icon={Calendar} label="Due" value={formatDate(inv.due)} />
        </Card>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="text-slate-400" />
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {href ? <Link href={href} className="text-sm font-semibold text-blue-600 hover:underline">{value}</Link>
          : <span className="text-sm font-semibold text-slate-900">{value}</span>}
      </div>
    </div>
  );
}
