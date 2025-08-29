import { useFacebookAuthUrlQuery } from "../../services/facebookApi";
import { Button } from "../../components/ui/Button";
import { useToast } from "../../components/ui/use-toast";

const OnboardingConnectPage = () => {
  const { toast } = useToast();
  const { refetch, isFetching } = useFacebookAuthUrlQuery({
    onSuccess: (authUrl: string) => {
      window.location.href = authUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: "Không thể lấy URL kết nối Facebook. Vui lòng thử lại.",
        variant: "destructive",
      });
      console.error(error);
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-100">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-neutral-900">Welcome!</h1>
        <p className="mt-2 text-neutral-600">
          Let's connect your Facebook page to get started.
        </p>
        <Button
          size="lg"
          className="mt-8"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          {isFetching ? "Connecting..." : "Connect with Facebook"}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingConnectPage;
