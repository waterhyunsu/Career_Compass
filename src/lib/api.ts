import { createClient } from "@supabase/supabase-js";
import { survey, type Survey } from "../data/survey";
import type { Answers } from "./domain";
import { chooseSurvey } from "./version";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export type Profile = { id: string; nickname: string; is_test: boolean };
export type Submission = {
  id: string;
  user_id: string;
  version_id: string;
  answers: Answers;
  status: string;
  submitted_at: string | null;
  updated_at: string;
};
export type Favorite = {
  user_id: string;
  school_id: string;
  department_id: string | null;
  note: string;
  target_id: string;
};
function unwrap<T>(r: { data: T; error: unknown }): T {
  if (r.error) throw r.error;
  return r.data;
}
export async function getProfile(id: string) {
  return unwrap(
    await supabase!.from("profiles").select("*").eq("id", id).single(),
  ) as Profile;
}
export async function isAdmin() {
  return Boolean(unwrap(await supabase!.rpc("is_admin")));
}
export async function loadSurvey(
  userId: string,
): Promise<{ survey: Survey; submission: Submission | null }> {
  const [priorResult, versionResult] = await Promise.all([
    supabase!
      .from("submissions")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }),
    supabase!
      .from("survey_versions")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);
  return chooseSurvey(
    unwrap(versionResult) as Survey[],
    unwrap(priorResult) as Submission[],
  );
}
export async function saveSurvey(
  version: string,
  answers: Answers,
  submit = false,
): Promise<Submission> {
  return unwrap(
    await supabase!.rpc("save_survey", {
      p_version: version,
      p_answers: answers,
      p_submit: submit,
    }),
  ) as Submission;
}
export async function loadFavorites() {
  return unwrap(await supabase!.from("favorites").select("*")) as Favorite[];
}
export async function saveFavorite(f: Favorite, remove = false) {
  if (remove)
    unwrap(
      await supabase!
        .from("favorites")
        .delete()
        .eq("user_id", f.user_id)
        .eq("school_id", f.school_id)
        .eq("target_id", f.department_id ?? ""),
    );
  else {
    const { target_id: _, ...record } = f;
    unwrap(
      await supabase!
        .from("favorites")
        .upsert(record, { onConflict: "user_id,school_id,target_id" }),
    );
  }
}
export async function loadReport(id: string) {
  const r = unwrap(
    await supabase!
      .from("published_reports")
      .select("*")
      .eq("submission_id", id)
      .maybeSingle(),
  );
  return r?.markdown as string | undefined;
}
export async function adminData() {
  const submissions = unwrap(
    await supabase!
      .from("submissions")
      .select("*")
      .neq("status", "draft")
      .order("submitted_at", { ascending: false }),
  ) as Submission[];
  const profiles = unwrap(
    await supabase!.from("profiles").select("*"),
  ) as Profile[];
  const favorites = unwrap(
    await supabase!.from("favorites").select("*"),
  ) as Favorite[];
  const versions = unwrap(
    await supabase!.from("survey_versions").select("*"),
  ) as Survey[];
  return { submissions, profiles, favorites, versions };
}
export async function loadDraft(id: string) {
  return (
    unwrap(
      await supabase!
        .from("report_drafts")
        .select("*")
        .eq("submission_id", id)
        .maybeSingle(),
    )?.markdown ?? ""
  );
}
export async function saveReport(id: string, markdown: string) {
  unwrap(
    await supabase!.from("report_drafts").upsert({
      submission_id: id,
      markdown,
      updated_at: new Date().toISOString(),
    }),
  );
}
export async function reportStatus(
  id: string,
  action: "publish" | "unpublish" | "review",
) {
  unwrap(
    await supabase!.rpc("set_report_status", {
      p_submission: id,
      p_action: action,
    }),
  );
}
export async function deleteTestData(userId: string) {
  unwrap(await supabase!.rpc("delete_test_data", { p_user: userId }));
}
export function errorText(e: unknown) {
  return e instanceof Error
    ? e.message
    : typeof e === "object" && e !== null && "message" in e
      ? String(e.message)
      : "연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.";
}
export const previewSurvey = survey;
