import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PharmacyLogin() {
  const [pharmacyId, setPharmacyId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Store pharmacy ID and navigate to notifications
    localStorage.setItem("pharmacy_id", pharmacyId);
    navigate("/pharmacy/notifications");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Вход в аптеку</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID аптеки</label>
              <Input
                type="text"
                placeholder="123"
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !pharmacyId}
              size="lg"
            >
              {loading ? "Входим..." : "Войти"}
            </Button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Используйте любой ID</p>
            <p>Пример: 123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
