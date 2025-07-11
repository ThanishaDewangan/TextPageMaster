import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Download, Eye } from "lucide-react";

export default function InvoiceGenerator() {
  const [, params] = useRoute("/invoice/:id");
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["/api/invoices", params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/${params?.id}`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch invoice");
      return res.json();
    },
    enabled: !!params?.id,
  });

  const handleDownloadPDF = async () => {
    if (!invoice) return;

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Invoice PDF downloaded successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <Loading size="lg" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <p className="text-white">Invoice not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Invoice Generator</h1>
          <p className="text-gray-400">Professional PDF invoice ready for download</p>
        </div>

        <Card className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gray-900 text-white p-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">INVOICE GENERATOR</h1>
                <p className="text-gray-300 mt-2">Professional Invoice Services</p>
              </div>
              <div className="text-right">
                <div className="bg-primary-500 text-white px-4 py-2 rounded-lg inline-block">
                  <span className="font-semibold">Levitation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8 bg-white text-gray-800">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice Number:</span>
                    <span className="font-semibold">{invoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {new Date(invoice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-semibold">
                      {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">Company:</span>
                    <span className="font-semibold ml-2">{invoice.clientCompany || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-semibold ml-2">{invoice.clientName}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold ml-2">{invoice.clientEmail}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    <th className="border border-gray-300 p-4 text-left">Product</th>
                    <th className="border border-gray-300 p-4 text-center">Qty</th>
                    <th className="border border-gray-300 p-4 text-right">Rate</th>
                    <th className="border border-gray-300 p-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="border border-gray-300 p-4">{item.productName}</td>
                      <td className="border border-gray-300 p-4 text-center">{item.quantity}</td>
                      <td className="border border-gray-300 p-4 text-right">
                        ${parseFloat(item.rate).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-4 text-right font-semibold">
                        ${parseFloat(item.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="mt-8 flex justify-end">
              <div className="w-full max-w-md">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">${parseFloat(invoice.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST (18%):</span>
                      <span className="font-semibold">${parseFloat(invoice.totalGst).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total Amount:</span>
                        <span className="text-primary-600">${parseFloat(invoice.totalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-gray-900 text-white p-6 rounded-lg">
                <p className="text-sm text-center">
                  <strong>Thank you for your business!</strong><br />
                  Payment is due within 14 days. For any questions regarding this invoice, please contact us at support@invoicegenerator.com
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-100 p-6 flex justify-center space-x-4">
            <Button
              onClick={handleDownloadPDF}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate PDF
            </Button>
            <Button
              variant="outline"
              className="px-6 py-3 rounded-lg font-semibold flex items-center"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
