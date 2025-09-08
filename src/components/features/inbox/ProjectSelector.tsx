// src/components/features/inbox/ProjectSelector.tsx

import { useNavigate } from "react-router-dom";
import { type Project } from "../../../services/projectApi";
import { Select } from "../../../components/ui/Select";

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId?: string;
}

export const ProjectSelector = ({
  projects,
  activeProjectId,
}: ProjectSelectorProps) => {
  const navigate = useNavigate();

  const handleProjectChange = (projectId: string) => {
    navigate(`/inbox/projects/${projectId}`);
  };

  // SỬA LỖI: Chuyển đổi mảng 'projects' sang định dạng mà component 'Select' yêu cầu
  const selectOptions = projects.map((project) => ({
    value: project.id.toString(),
    label: project.name,
  }));

  return (
    // SỬA LỖI: Sử dụng component 'Select' với các props chính xác
    <Select
      value={activeProjectId || ""}
      onChange={handleProjectChange}
      options={selectOptions}
      placeholder="Select a project..."
    />
  );
};
