// src/pages/inbox/InboxLayout.tsx
import { useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageSquare, AlertTriangle } from "lucide-react";
import * as projectApi from "../../services/projectApi";
import { ProjectSelector } from "../../components/features/inbox/ProjectSelector";
import { ConversationList } from "../../components/features/inbox/ConversationList";
import { Spinner } from "../../components/ui/Spinner";
import { SocketProvider } from "../../contexts/SocketContext";
import { Button } from "../../components/ui/Button"; // Import Button

export const InboxLayout = () => {
  const navigate = useNavigate();
  const { projectId, conversationId } = useParams<{
    projectId: string;
    conversationId: string;
  }>();

  const {
    data: projects,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.getProjects,
  });

  useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      navigate(`/inbox/projects/${projects[0].id}`, { replace: true });
    }
  }, [projects, projectId, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (isError || !projects) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center bg-background text-foreground">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Lỗi tải dự án</h2>
        <p className="mt-2 text-muted-foreground">
          Không thể tải danh sách dự án. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center bg-background text-foreground">
        <h2 className="text-xl font-semibold">Không tìm thấy dự án nào</h2>
        <p className="mt-2 text-muted-foreground">
          Vui lòng tạo một dự án trong phần cài đặt để bắt đầu nhận tin nhắn.
        </p>
        <Button className="mt-4" onClick={() => navigate("/settings/projects")}>
          Đi đến Cài đặt Dự án
        </Button>
      </div>
    );
  }

  return (
    <SocketProvider>
      <div className="flex h-[calc(100vh-5rem)] bg-muted/40">
        {" "}
        {/* Adjusted for header height */}
        <aside className="flex flex-col w-full md:w-1/3 max-w-sm border-r bg-card">
          <header className="p-4 border-b">
            <ProjectSelector projects={projects} activeProjectId={projectId} />
          </header>
          <main className="flex-1 overflow-y-auto">
            <ConversationList />
          </main>
        </aside>
        <main className="flex-1 hidden md:grid place-items-center">
          {conversationId ? (
            <Outlet />
          ) : (
            <div className="text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Chào mừng đến Hộp thư của bạn
              </h2>
              <p className="mt-2 text-sm">
                Chọn một cuộc trò chuyện từ danh sách bên trái để xem tin nhắn.
              </p>
            </div>
          )}
        </main>
      </div>
    </SocketProvider>
  );
};
