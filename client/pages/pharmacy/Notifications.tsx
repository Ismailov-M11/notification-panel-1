import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Volume2, VolumeX } from "lucide-react";
import { io, Socket } from "socket.io-client";

interface IncomingCall {
  pharmacy_id: string;
  drugs: string[];
  total: number;
}

// 🧠 Универсальная функция для подключения к backend
const getApiUrl = () => {
  if (import.meta.env.PROD) {
    // если проект собран и развернут — использовать тот же домен
    return window.location.origin;
  } else {
    // в режиме разработки всегда направляем на backend порт 3001
    return "http://localhost:3001";
  }
};

// 🔔 Класс для звукового сигнала (версия с MP3)
class AlertSound {
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  constructor() {
    // 🔊 Используем mp3-файл из public/
    this.audio = new Audio("/alert.mp3");
    this.audio.loop = true; // повторять, пока не остановим
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.audio?.play().catch(() => {
      console.warn("⚠️ Не удалось воспроизвести звук (нужно действие пользователя)");
    });
  }

  stop() {
    this.isPlaying = false;
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
}

export default function PharmacyNotifications() {
  const [pharmacyId, setPharmacyId] = useState("");
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef<AlertSound | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedPharmacyId = localStorage.getItem("pharmacy_id");
    if (!savedPharmacyId) {
      navigate("/pharmacy/login");
      return;
    }
    setPharmacyId(savedPharmacyId);

    // Инициализация звука
    soundRef.current = new AlertSound();

    // Подключение к серверу Socket.IO
    const socket = io(getApiUrl(), {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to server");
      socket.emit("pharmacy_login", { pharmacy_id: savedPharmacyId });
    });

    socket.on("login_success", (data) => {
      console.log("Pharmacy login successful:", data);
    });

    socket.on("incoming_call", (data: IncomingCall) => {
      console.log("📦 Incoming call received:", data);
      setIncomingCall(data);
      if (soundRef.current && soundEnabled) {
        soundRef.current.play();
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socketRef.current = socket;

    return () => {
      soundRef.current?.stop();
      socket.disconnect();
    };
  }, [navigate, soundEnabled]);

  const handleResponse = (accepted: boolean) => {
    if (soundRef.current) {
      soundRef.current.stop();
    }

    if (socketRef.current && incomingCall) {
      socketRef.current.emit("response", {
        pharmacy_id: incomingCall.pharmacy_id,
        accepted,
      });
    }

    setIncomingCall(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("pharmacy_id");
    soundRef.current?.stop();
    socketRef.current?.disconnect();
    navigate("/pharmacy/login");
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  const isSoundPlaying = incomingCall !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Аптека {pharmacyId}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isSoundPlaying ? "Входящий звонок..." : "Ожидание заказов..."}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Выход
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Статус системы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Статус подключения:</span>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Подключено</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Звук:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSound}
                  className="gap-2"
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Включен
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Выключен
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-center text-blue-800">
                  {isSoundPlaying
                    ? "❗ Входящий звонок - приём заказа!"
                    : "✓ Система активна и ожидает заказов"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Модальное окно входящего заказа */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-96 h-96 bg-primary/20 rounded-full animate-pulse"></div>
            <div
              className="absolute w-80 h-80 bg-primary/30 rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute w-64 h-64 bg-primary/40 rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <Card className="w-full max-w-md relative z-10 shadow-2xl">
            <CardHeader className="bg-primary text-white">
              <CardTitle className="text-center text-2xl">
                🔔 Новый заказ!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-900 mb-3">
                    Список лекарств:
                  </p>
                  <ul className="space-y-2">
                    {incomingCall.drugs.map((drug, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-blue-800 flex items-start"
                      >
                        <span className="mr-2">•</span>
                        <span>{drug}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-900 mb-1">
                    Сумма заказа:
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {incomingCall.total.toLocaleString()} сум
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => handleResponse(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    ✅ Принять
                  </Button>
                  <Button
                    onClick={() => handleResponse(false)}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    ❌ Отклонить
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
