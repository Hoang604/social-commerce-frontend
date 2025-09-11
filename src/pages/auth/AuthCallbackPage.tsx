// src/pages/auth/AuthCallbackPage.tsx
import { useEffect, useRef } from "react"; // 1. Import thêm useRef
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Spinner } from "../../components/ui/Spinner";
import { exchangeCodeForToken } from "../../services/authApi";
import { useToast } from "../../components/ui/use-toast";

export const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // 2. Lấy action từ store theo cách đúng chuẩn của React
  const setAuthData = useAuthStore((state) => state.setAuthData);
  const { toast } = useToast();

  // 3. Sử dụng ref để đảm bảo effect chỉ chạy logic chính một lần duy nhất
  const effectRan = useRef(false);

  useEffect(() => {
    // Trong môi trường dev với StrictMode, effect sẽ chạy 2 lần.
    // Ref này sẽ ngăn chặn việc gọi API ở lần chạy thứ 2.
    if (effectRan.current === true) {
      return;
    }

    const code = searchParams.get("code");

    const handleExchangeCode = async (codeToExchange: string) => {
      try {
        const authData = await exchangeCodeForToken(codeToExchange);
        setAuthData(authData);
        toast({
          title: "Successfully authenticated!",
          description: "Welcome back.",
        });
        navigate("/inbox", { replace: true });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: "The code is invalid or has expired. Please try again.",
        });
        navigate("/login", { replace: true });
      }
    };

    if (code) {
      handleExchangeCode(code);
    } else {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "No authentication code provided.",
      });
      navigate("/login", { replace: true });
    }

    // Đánh dấu là effect đã chạy logic
    return () => {
      effectRan.current = true;
    };
    // 4. Dependency array được giữ gọn gàng
  }, [searchParams, navigate, setAuthData, toast]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-10 w-10">
        <Spinner />
      </div>
      <p className="ml-4 text-muted-foreground">Authenticating...</p>
    </div>
  );
};
