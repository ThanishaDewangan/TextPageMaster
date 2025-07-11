import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Trash2, Plus, FileText } from "lucide-react";
import { useLocation } from "wouter";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  rate: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Rate must be a positive number"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProduct() {
  const { getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      rate: "",
    },
  });

  const watchedValues = watch();
  const total = watchedValues.quantity && watchedValues.rate 
    ? watchedValues.quantity * parseFloat(watchedValues.rate || "0")
    : 0;
  const gst = total * 0.18;

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const res = await fetch("/api/products", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const res = await apiRequest("POST", "/api/products", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product added successfully!",
      });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/products/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Success",
        description: "Product deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const res = await apiRequest("POST", "/api/invoices", invoiceData);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Invoice generated successfully!",
      });
      setLocation(`/invoice/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProductFormData) => {
    addProductMutation.mutate(data);
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const toggleProductSelection = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) 
        ? prev.filter(pid => pid !== id)
        : [...prev, id]
    );
  };

  const handleGenerateInvoice = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one product",
        variant: "destructive",
      });
      return;
    }

    const invoiceData = {
      clientName: "Client Name",
      clientEmail: "client@example.com",
      clientCompany: "Client Company",
      productIds: selectedProducts,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    };

    generateInvoiceMutation.mutate(invoiceData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <Loading size="lg" />
      </div>
    );
  }

  const selectedProductsData = products?.filter((p: any) => selectedProducts.includes(p.id)) || [];
  const subtotal = selectedProductsData.reduce((sum: number, product: any) => sum + parseFloat(product.total), 0);
  const totalGst = selectedProductsData.reduce((sum: number, product: any) => sum + parseFloat(product.gst), 0);
  const totalAmount = subtotal + totalGst;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Add Products</h1>
          <p className="text-gray-400">Add products to your invoice with automatic calculations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Form */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Product Information</CardTitle>
              <CardDescription className="text-gray-400">
                Add new products with quantity and rate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-gray-300">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Qty"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                      {...register("quantity", { valueAsNumber: true })}
                    />
                    {errors.quantity && (
                      <p className="text-red-400 text-sm">{errors.quantity.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate" className="text-gray-300">
                      Rate ($)
                    </Label>
                    <Input
                      id="rate"
                      type="number"
                      step="0.01"
                      placeholder="Rate"
                      className="bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-primary-500"
                      {...register("rate")}
                    />
                    {errors.rate && (
                      <p className="text-red-400 text-sm">{errors.rate.message}</p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <span>Product Total:</span>
                    <span className="font-semibold text-white">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-300 mt-2">
                    <span>GST (18%):</span>
                    <span className="font-semibold text-white">${gst.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={addProductMutation.isPending}
                  className="w-full bg-primary-500 hover:bg-primary-600"
                >
                  {addProductMutation.isPending ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Product List */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Added Products</CardTitle>
              <CardDescription className="text-gray-400">
                Select products to include in your invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              {products && products.length > 0 ? (
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg border border-gray-600">
                    <div className="p-4 border-b border-gray-700">
                      <div className="grid grid-cols-5 gap-4 text-sm font-medium text-gray-300">
                        <span>Select</span>
                        <span>Product</span>
                        <span>Qty</span>
                        <span>Rate</span>
                        <span>Total</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-700">
                      {products.map((product: any) => (
                        <div key={product.id} className="p-4 grid grid-cols-5 gap-4 text-sm items-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 text-primary-500 bg-gray-800 border-gray-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-white font-medium">{product.name}</span>
                          <span className="text-gray-300">{product.quantity}</span>
                          <span className="text-gray-300">${parseFloat(product.rate).toFixed(2)}</span>
                          <div className="flex items-center justify-between">
                            <span className="text-primary-400 font-semibold">
                              ${parseFloat(product.total).toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="ml-2 text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedProducts.length > 0 && (
                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Subtotal:</span>
                          <span className="text-white font-semibold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">GST (18%):</span>
                          <span className="text-white font-semibold">${totalGst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-600">
                          <span className="text-white">Total:</span>
                          <span className="text-primary-400">${totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateInvoice}
                    disabled={selectedProducts.length === 0 || generateInvoiceMutation.isPending}
                    className="w-full bg-primary-500 hover:bg-primary-600"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {generateInvoiceMutation.isPending ? "Generating..." : "Generate Invoice"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Plus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No products yet</p>
                  <p className="text-gray-500 text-sm">
                    Add your first product using the form on the left
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
