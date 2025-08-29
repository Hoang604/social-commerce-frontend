// src/pages/settings/ProfilePage.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useUserProfileQuery,
  useUpdateProfileMutation,
} from "../../services/settingsApi";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

interface ProfileFormData {
  fullName: string;
  avatarUrl: string;
}

export function ProfilePage() {
  const { data: user, isLoading, isError } = useUserProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const { register, handleSubmit, reset } = useForm<ProfileFormData>();

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || "",
        avatarUrl: user.avatarUrl || "",
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile.mutate(data);
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (isError) return <div>Failed to load profile.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-foreground"
          >
            Full Name
          </label>
          <Input id="fullName" {...register("fullName")} />
        </div>
        <div>
          <label
            htmlFor="avatarUrl"
            className="block text-sm font-medium text-foreground"
          >
            Avatar URL
          </label>
          <Input id="avatarUrl" {...register("avatarUrl")} />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
