import { redirect } from "next/navigation";

export default function NoMigrationPage() {
  redirect("/track-migration");
}
