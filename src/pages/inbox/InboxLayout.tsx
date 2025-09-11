// src/pages/inbox/InboxLayout.tsx

import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as projectApi from "../../services/projectApi";
import { ProjectSelector } from "../../components/features/inbox/ProjectSelector";
import { Spinner } from "../../components/ui/Spinner";
import { SocketProvider } from "../../contexts/SocketContext";
import { ConversationList } from "../../components/features/inbox/ConversationList";
import { MessageSquare } from "lucide-react";
import { useEffect } from "react";

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

  console.log(
    `%c--- RENDER INBOX LAYOUT --- [${new Date().toLocaleTimeString()}]`,
    "color: blue; font-weight: bold;",
    {
      isLoading,
      projectId,
      projects: projects ? `(Array with ${projects.length} items)` : projects,
    }
  );

  useEffect(() => {
    if (projects && projects.length > 0 && !projectId) {
      console.log(projects);
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
    return <div>Error loading projects. Please try again later.</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center">
        <h2 className="text-xl font-semibold">No projects found.</h2>
        <p className="mt-2 text-gray-600">
          Please create a project in the settings to start receiving messages.
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate("/settings/projects")}
        >
          Go to Project Settings
        </button>
      </div>
    );
  }

  return (
    <SocketProvider>
      {/* <RealtimeProvider /> */}
      <div className="flex h-[calc(100vh-3.5rem)] bg-muted/40">
        <div className="flex flex-col w-full md:w-1/3 max-w-sm border-r bg-card">
          {/* ... (phần header và main bên trái giữ nguyên) */}
          <header className="p-4 border-b">
            <ProjectSelector projects={projects} activeProjectId={projectId} />
          </header>
          <main className="flex-1 overflow-y-auto">
            <ConversationList />
          </main>
        </div>
        {/* SỬA LỖI: Cập nhật lại khung bên phải */}
        <div className="flex-1 hidden md:grid place-items-center">
          {conversationId ? (
            <Outlet />
          ) : (
            <div className="text-center text-muted-foreground">
              <MessageSquare className="mx-auto h-12 w-12" />
              <h2 className="mt-4 text-xl font-semibold text-foreground">
                Welcome to your Inbox
              </h2>
              <p className="mt-2 text-sm">
                Select a conversation from the list on the left to see messages.
              </p>
            </div>
          )}
        </div>
      </div>
    </SocketProvider>
  );
};
