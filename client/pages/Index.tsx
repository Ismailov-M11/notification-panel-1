import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-blue-50 to-primary/5 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-3">
            📱 Davo Delivery
          </h1>
          <p className="text-lg text-muted-foreground">
            Система оповещений о заказах для аптек
          </p>
        </div>

        {/* Login Card */}
        <div className="max-w-md mx-auto mb-8">
          <Card className="hover:shadow-lg transition-shadow border-primary/20">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-primary text-white">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6" />
                Аптека
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-6">
                Получайте входящие звонки и управляйте заказами
              </p>
              <a href="/pharmacy/login" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Войти как аптека
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Как это работает</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-sm">
                    1
                  </div>
                </div>
                <div>
                  <p className="font-medium">API отправляет заказ</p>
                  <p className="text-sm text-muted-foreground">
                    Внешняя система отправляет заказ через API с данными аптеки
                    и лекарств
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-sm">
                    2
                  </div>
                </div>
                <div>
                  <p className="font-medium">Сервер получает данные</p>
                  <p className="text-sm text-muted-foreground">
                    Backend обрабатывает запрос и отправляет уведомление в
                    аптеку через WebSocket
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-white font-bold text-sm">
                    3
                  </div>
                </div>
                <div>
                  <p className="font-medium">Аптека получает звонок</p>
                  <p className="text-sm text-muted-foreground">
                    На экране аптеки появляется модальное окно с информацией о
                    заказе и проигрывается звуковой сигнал
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
