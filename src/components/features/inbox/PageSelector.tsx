import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api";
import { cn } from "../../../lib/utils";

const getConnectedPages = async () => {
  const { data } = await api.get("/connected-pages");
  return data;
};

interface PageSelectorProps {
  selectedPageId: string | null;
  onPageChange: (pageId: string | null) => void;
}

const PageSelector = ({ selectedPageId, onPageChange }: PageSelectorProps) => {
  const { data: pages, isLoading } = useQuery({
    queryKey: ["connectedPages"],
    queryFn: getConnectedPages,
  });

  if (isLoading) return <div>Loading Pages...</div>;

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Your Pages</h2>
      <ul>
        {pages?.map((page: any) => (
          <li key={page.id}>
            <button
              onClick={() => onPageChange(page.id)}
              className={cn(
                "w-full text-left p-2 rounded-md",
                page.id === selectedPageId
                  ? "bg-primary-100 text-primary-600 font-semibold"
                  : "hover:bg-neutral-100"
              )}
            >
              {page.pageName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PageSelector;
