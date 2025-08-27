// src/pages/settings/ConnectionsPage.tsx
import {
  useConnectedPagesQuery,
  useDisconnectPageMutation,
} from "../../services/settingsApi";
import { Button } from "../../components/ui/Button";
import { ConnectPageButton } from "../../components/features/inbox/ConnectPageButton";

export function ConnectionsPage() {
  const { data: pages, isLoading, isError } = useConnectedPagesQuery();
  const disconnectPage = useDisconnectPageMutation();

  const handleDisconnect = (pageId: string, pageName: string) => {
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ngắt kết nối trang "${pageName}"? Mọi dữ liệu liên quan sẽ không còn được đồng bộ.`
      )
    ) {
      disconnectPage.mutate(pageId);
    }
  };

  if (isLoading) return <div>Loading connected pages...</div>;
  if (isError) return <div>Failed to load pages.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Connections</h1>
        <ConnectPageButton />
      </div>

      <div className="space-y-3">
        {pages && pages.length > 0 ? (
          pages.map((page) => (
            <div
              key={page.id}
              className="p-4 border rounded-md flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{page.name}</p>
                <p className="text-sm text-gray-500">
                  Connected on: {new Date(page.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDisconnect(page.id, page.name)}
                disabled={
                  disconnectPage.isPending &&
                  disconnectPage.variables === page.id
                }
              >
                {disconnectPage.isPending &&
                disconnectPage.variables === page.id
                  ? "Đang ngắt kết nối..."
                  : "Ngắt kết nối"}
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 px-4 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">Bạn chưa kết nối trang nào.</p>
          </div>
        )}
      </div>
    </div>
  );
}
