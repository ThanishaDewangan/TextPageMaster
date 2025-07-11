import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth";
import { Plus, FileText, Download, Eye } from "lucide-react";

export default function Dashboard() {
  const { getAuthHeaders } = useAuth();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
    queryFn: async () => {
      const res = await fetch("/api/invoices", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) throw new Error("Failed to generate PDF");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Manage your invoices and products</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary-400" />
                Add Product
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add new products to your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/add-product">
                <Button className="w-full bg-primary-500 hover:bg-primary-600">
                  Add Product
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-400" />
                Products
              </CardTitle>
              <CardDescription className="text-gray-400">
                {products?.length || 0} products available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/add-product">
                <Button variant="outline" className="w-full">
                  View Products
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary-400" />
                Invoices
              </CardTitle>
              <CardDescription className="text-gray-400">
                {invoices?.length || 0} invoices generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                ${invoices?.reduce((sum: number, invoice: any) => sum + parseFloat(invoice.totalAmount), 0).toFixed(2) || "0.00"}
              </div>
              <p className="text-gray-400 text-sm">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Invoices */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Invoices</CardTitle>
            <CardDescription className="text-gray-400">
              Your latest generated invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices && invoices.length > 0 ? (
              <div className="space-y-4">
                {invoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-white">
                            {invoice.invoiceNumber}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {invoice.clientName} • {invoice.clientEmail}
                          </p>
                        </div>
                        <Badge
                          variant={
                            invoice.status === "paid"
                              ? "default"
                              : invoice.status === "sent"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {invoice.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${parseFloat(invoice.totalAmount).toFixed(2)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadPDF(invoice.id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Link href={`/invoice/${invoice.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No invoices yet</p>
                <p className="text-gray-500 text-sm">
                  Start by adding some products and creating your first invoice
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
