// src/components/features/inbox/ConnectPageButton.tsx
import { useFacebookAuthUrlMutation } from "../../../services/facebookApi";
import { Button } from "../../ui/Button";

export function ConnectPageButton() {
  const { mutate: getAuthUrl, isPending } = useFacebookAuthUrlMutation();

  const handleClick = () => {
    getAuthUrl();
  };

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? "Đang xử lý..." : "Kết nối Trang mới"}
    </Button>
  );
}
