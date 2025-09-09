// src/pages/inbox/InboxRedirector.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as projectApi from "../../services/projectApi";
import { Spinner } from "../../components/ui/Spinner";

export const InboxRedirector = () => {
  const navigate = useNavigate();
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.getProjects,
  });

  useEffect(() => {
    if (projects && projects.length > 0) {
      // Khi có danh sách projects, chuyển hướng đến project đầu tiên
      navigate(`/inbox/projects/${projects[0].id}`, { replace: true });
    }
    // Nếu không có project nào, người dùng sẽ bị kẹt ở màn hình loading,
    // nhưng InboxLayout sẽ xử lý việc hiển thị thông báo "No projects found."
  }, [projects, navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Spinner />
    </div>
  );
};
