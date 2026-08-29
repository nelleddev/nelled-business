"use server";

import { revalidatePath } from "next/cache";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import { createClient } from "@/lib/supabase/server";

function revalidateFaq() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/faq");
}

function getText(
  formData: FormData,
  key: string,
) {
  return String(
    formData.get(key) ?? "",
  ).trim();
}

export async function saveFaq(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return;
  }

  const id = getText(
    formData,
    "id",
  );

  const question = getText(
    formData,
    "question",
  );

  const answer = getText(
    formData,
    "answer",
  );

  const isActive =
    formData.get("is_active") ===
    "on";

  if (!question || !answer) {
    return;
  }

  const supabase =
    await createClient();

  if (id) {
    await supabase
      .from("faq_items")
      .update({
        question,
        answer,
        is_active: isActive,
      })
      .eq("id", id)
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      );
  } else {
    const { data: last } =
      await supabase
        .from("faq_items")
        .select("position")
        .eq(
          "tenant_id",
          currentTenant.tenant.id,
        )
        .order("position", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

    await supabase
      .from("faq_items")
      .insert({
        tenant_id:
          currentTenant.tenant.id,
        question,
        answer,
        is_active: isActive,
        position:
          (last?.position ?? -1) +
          1,
      });
  }

  revalidateFaq();
}

export async function toggleFaq(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return;
  }

  const id = getText(
    formData,
    "id",
  );

  const currentValue =
    String(
      formData.get(
        "is_active",
      ) ?? "",
    ) === "true";

  if (!id) {
    return;
  }

  const supabase =
    await createClient();

  await supabase
    .from("faq_items")
    .update({
      is_active:
        !currentValue,
    })
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  revalidateFaq();
}

export async function moveFaq(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return;
  }

  const id = getText(
    formData,
    "id",
  );

  const direction =
    getText(
      formData,
      "direction",
    );

  if (
    !id ||
    (direction !== "up" &&
      direction !== "down")
  ) {
    return;
  }

  const supabase =
    await createClient();

  const tenantId =
    currentTenant.tenant.id;

  const {
    data: current,
    error: currentError,
  } = await supabase
    .from("faq_items")
    .select("id, position")
    .eq("id", id)
    .eq(
      "tenant_id",
      tenantId,
    )
    .maybeSingle();

  if (
    currentError ||
    !current
  ) {
    return;
  }

  let neighborQuery =
    supabase
      .from("faq_items")
      .select(
        "id, position",
      )
      .eq(
        "tenant_id",
        tenantId,
      );

  if (direction === "up") {
    neighborQuery =
      neighborQuery
        .lt(
          "position",
          current.position,
        )
        .order("position", {
          ascending: false,
        });
  } else {
    neighborQuery =
      neighborQuery
        .gt(
          "position",
          current.position,
        )
        .order("position", {
          ascending: true,
        });
  }

  const {
    data: neighbor,
  } = await neighborQuery
    .limit(1)
    .maybeSingle();

  if (!neighbor) {
    return;
  }

  await Promise.all([
    supabase
      .from("faq_items")
      .update({
        position:
          neighbor.position,
      })
      .eq(
        "id",
        current.id,
      )
      .eq(
        "tenant_id",
        tenantId,
      ),

    supabase
      .from("faq_items")
      .update({
        position:
          current.position,
      })
      .eq(
        "id",
        neighbor.id,
      )
      .eq(
        "tenant_id",
        tenantId,
      ),
  ]);

  revalidateFaq();
}

export async function deleteFaq(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    return;
  }

  const id = getText(
    formData,
    "id",
  );

  if (!id) {
    return;
  }

  const supabase =
    await createClient();

  await supabase
    .from("faq_items")
    .delete()
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  revalidateFaq();
}