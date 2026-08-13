import { useUser } from "@clerk/nextjs";

export function useIsAgency(): boolean { 
  const { user } = useUser();
  return user?.unsafeMetadata?.accountType === "business";
}
