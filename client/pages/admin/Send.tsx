import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, LogOut } from "lucide-react";

export default function AdminSend() {
  const [pharmacyId, setPharmacyId] = useState("");
  const [drugs, setDrugs] = useState("");
  const [total, setTotal] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("admin_token");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    navigate("/admin/login");
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!pharmacyId || !drugs || !total) {
        throw new Error("All fields are required");
      }

      const drugsArray = drugs
        .split("\n")
        .map((d) => d.trim())
        .filter((d) => d);

      const response = await fetch(`/api/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pharmacy_id: pharmacyId,
          drugs: drugsArray,
          total: parseInt(total),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      setSuccess("✅ Уведомление отправлено успешно!");
      setPharmacyId("");
      setDrugs("");
      setTotal("");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send notification",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Отправить уведомление в аптеку</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">ID аптеки</label>
                <Input
                  placeholder="123"
                  value={pharmacyId}
                  onChange={(e) => setPharmacyId(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Список лекарств (по одному на строку)
                </label>
                <Textarea
                  placeholder="Aspirin&#10;Paracetamol&#10;Ibuprofen"
                  value={drugs}
                  onChange={(e) => setDrugs(e.target.value)}
                  disabled={loading}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Сумма (сум)</label>
                <Input
                  type="number"
                  placeholder="23000"
                  value={total}
                  onChange={(e) => setTotal(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? "Отправка..." : "Отправить уведомление"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
