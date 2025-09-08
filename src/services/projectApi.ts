import api from "../lib/api";

// --- Type Definitions ---

export interface WidgetSettings {
  primaryColor: string;
  welcomeMessage: string;
}

export interface Project {
  id: number; // Matched with backend: number
  name: string;
  siteUrl: string | null;
  widgetSettings: WidgetSettings;
}

export interface CreateProjectDto {
  name: string;
  siteUrl?: string;
}

export interface WidgetSettingsDto {
  primaryColor?: string;
  welcomeMessage?: string;
}

// --- API Functions ---

/**
 * Fetches all projects for the current user.
 */
export const getProjects = async (): Promise<Project[]> => {
  const response = await api.get("/projects");
  return response.data;
};

/**
 * Creates a new project.
 * @param data - The data for the new project.
 */
export const createProject = async (
  data: CreateProjectDto
): Promise<Project> => {
  const response = await api.post("/projects", data);
  return response.data;
};

/**
 * Updates the widget settings for a specific project.
 * @param projectId - The ID of the project to update.
 * @param settings - The new widget settings.
 */
export const updateProjectSettings = async (
  projectId: number,
  settings: WidgetSettingsDto
): Promise<Project> => {
  const response = await api.patch(`/projects/${projectId}`, {
    widgetSettings: settings,
  });
  return response.data;
};
