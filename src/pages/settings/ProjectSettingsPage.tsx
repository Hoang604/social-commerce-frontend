import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as projectApi from "../../services/projectApi";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";

export const ProjectSettingsPage = () => {
  const queryClient = useQueryClient();
  const [newProjectName, setNewProjectName] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: projectApi.getProjects,
  });

  const createProjectMutation = useMutation({
    mutationFn: projectApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewProjectName("");
      // TODO: Show success toast
    },
    onError: () => {
      // TODO: Show error toast
    },
  });

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProjectMutation.mutate({ name: newProjectName.trim() });
    }
  };

  const getWidgetSnippet = (projectId: number) => {
    return `<script
  id="your-app-widget-script"
  src="https://cdn.yourdomain.com/widget.js"
  data-project-id="${projectId}"
  async
  defer
></script>`;
  };

  if (isLoading) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-foreground">
        Project Management
      </h1>

      {/* REFACTORED: Using theme-aware classes */}
      <div className="bg-card text-card-foreground border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Enter new project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            disabled={createProjectMutation.isPending}
          />
          <Button
            onClick={handleCreateProject}
            disabled={createProjectMutation.isPending}
          >
            {createProjectMutation.isPending ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {projects && projects.length > 0 ? (
          projects.map((project) => (
            // REFACTORED: Using theme-aware classes
            <div
              key={project.id}
              className="bg-card text-card-foreground border rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4">{project.name}</h3>

              <div className="mb-4">
                {/* REFACTORED: Using theme-aware classes */}
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  Installation Snippet
                </label>
                {/* REFACTORED: Using theme-aware classes */}
                <pre className="bg-muted text-muted-foreground p-4 rounded-md text-sm overflow-x-auto">
                  <code>{getWidgetSnippet(project.id)}</code>
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={() =>
                    navigator.clipboard.writeText(getWidgetSnippet(project.id))
                  }
                >
                  Copy Snippet
                </Button>
              </div>

              {/* Widget settings form would go here */}
            </div>
          ))
        ) : (
          // REFACTORED: Using theme-aware classes
          <p className="text-muted-foreground text-center">
            You don't have any projects yet. Create one to get started!
          </p>
        )}
      </div>
    </div>
  );
};
