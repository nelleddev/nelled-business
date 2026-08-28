"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { uploadImage } from "@/lib/cloudinary/upload";
import { createClient } from "@/lib/supabase/server";

function text(
  formData: FormData,
  key: string,
): string | null {
  const value = String(
    formData.get(key) ?? "",
  ).trim();

  return value || null;
}

function normalizeUsername(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .trim()
    .replace(
      /^https?:\/\/(www\.)?[^/]+\/?/i,
      "",
    )
    .replace(/^@/, "")
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .trim();

  return normalized || null;
}

function getFile(
  formData: FormData,
  key: string,
): File | null {
  const value = formData.get(key);

  if (
    !(value instanceof File) ||
    value.size === 0
  ) {
    return null;
  }

  return value;
}

type SiteSettingsPayload =
  Record<string, string | null>;

export async function updateSiteSettings(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const siteFolder = `nelled-business/${currentTenant.tenant.slug}/site`;
  const brandFolder = `nelled-business/${currentTenant.tenant.slug}/brand`;

  const heroFile = getFile(
    formData,
    "hero_image",
  );

  const aboutFile = getFile(
    formData,
    "about_image",
  );

  const logoFile = getFile(
    formData,
    "logo",
  );

  const [
    heroImage,
    aboutImage,
    logoImage,
  ] = await Promise.all([
    heroFile
      ? uploadImage(
          heroFile,
          siteFolder,
        )
      : Promise.resolve(null),

    aboutFile
      ? uploadImage(
          aboutFile,
          siteFolder,
        )
      : Promise.resolve(null),

    logoFile
      ? uploadImage(
          logoFile,
          brandFolder,
        )
      : Promise.resolve(null),
  ]);

  const instagram =
    normalizeUsername(
      text(
        formData,
        "instagram_username",
      ),
    );

  const facebook =
    normalizeUsername(
      text(
        formData,
        "facebook_username",
      ),
    );

  const tiktok =
    normalizeUsername(
      text(
        formData,
        "tiktok_username",
      ),
    );

  const payload: SiteSettingsPayload =
    {};

  const textFields = [
    "company_name",
    "short_name",
    "slogan",
    "whatsapp",
    "email",
    "city",
    "state",
    "service_area",
    "service_cities",
    "hero_eyebrow",
    "hero_title",
    "hero_description",
    "hero_secondary_text",
    "stat_1_value",
    "stat_1_label",
    "stat_2_value",
    "stat_2_label",
    "stat_3_value",
    "stat_3_label",
    "about_title",
    "about_content",
    "seo_title",
    "seo_description",
  ] as const;

  for (const field of textFields) {
    payload[field] = text(
      formData,
      field,
    );
  }

  payload.primary_color =
    text(
      formData,
      "primary_color",
    ) ?? "#0b3b6f";

  payload.secondary_color =
    text(
      formData,
      "secondary_color",
    ) ?? "#ffffff";

  payload.accent_color =
    text(
      formData,
      "accent_color",
    ) ?? "#f59e42";

  payload.instagram_username =
    instagram;

  payload.facebook_username =
    facebook;

  payload.tiktok_username =
    tiktok;

  payload.instagram_url = instagram
    ? `https://instagram.com/${instagram}`
    : null;

  payload.facebook_url = facebook
    ? `https://facebook.com/${facebook}`
    : null;

  payload.tiktok_url = tiktok
    ? `https://tiktok.com/@${tiktok}`
    : null;

  if (heroImage) {
    payload.hero_image_url =
      heroImage.secure_url;
  }

  if (aboutImage) {
    payload.about_image_url =
      aboutImage.secure_url;
  }

  if (logoImage) {
    payload.logo_light_url =
      logoImage.secure_url;

    payload.logo_dark_url =
      logoImage.secure_url;
  }

  const supabase =
    await createClient();

  const { error } = await supabase
    .from("tenant_settings")
    .update(payload)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (error) {
    redirect(
      `/admin/site?error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/site");

  redirect(
    "/admin/site?success=Site atualizado com sucesso",
  );
}