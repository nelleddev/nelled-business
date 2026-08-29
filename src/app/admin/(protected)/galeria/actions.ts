"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";

import { getCurrentTenant } from "@/lib/auth/get-current-tenant";
import {
  deleteImage,
  uploadImage,
} from "@/lib/cloudinary/upload";
import { createClient } from "@/lib/supabase/server";

type GalleryTable =
  | "gallery_items"
  | "before_after_items";

function text(
  formData: FormData,
  key: string,
) {
  const value = String(
    formData.get(key) ?? "",
  ).trim();

  return value || null;
}

function getFile(
  formData: FormData,
  key: string,
) {
  const value =
    formData.get(key);

  if (
    !(value instanceof File) ||
    value.size === 0
  ) {
    return null;
  }

  return value;
}

function checked(
  formData: FormData,
  key: string,
) {
  return (
    formData.get(key) === "on"
  );
}

function revalidateGallery() {
  revalidatePath("/");
  revalidatePath(
    "/admin",
  );
  revalidatePath(
    "/admin/galeria",
  );
}

function success(
  message: string,
): never {
  redirect(
    `/admin/galeria?success=${encodeURIComponent(
      message,
    )}`,
  );
}

function error(
  message: string,
): never {
  redirect(
    `/admin/galeria?error=${encodeURIComponent(
      message,
    )}`,
  );
}

async function moveItem(
  table: GalleryTable,
  id: string,
  direction: "up" | "down",
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const supabase =
    await createClient();

  const tenantId =
    currentTenant.tenant.id;

  const {
    data: current,
    error: currentError,
  } = await supabase
    .from(table)
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
    error(
      "Item não encontrado.",
    );
  }

  let neighborQuery =
    supabase
      .from(table)
      .select("id, position")
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
    error: neighborError,
  } = await neighborQuery
    .limit(1)
    .maybeSingle();

  if (neighborError) {
    error(
      neighborError.message,
    );
  }

  if (!neighbor) {
    return;
  }

  const [
    neighborUpdate,
    currentUpdate,
  ] = await Promise.all([
    supabase
      .from(table)
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

    supabase
      .from(table)
      .update({
        position:
          neighbor.position,
      })
      .eq("id", current.id)
      .eq(
        "tenant_id",
        tenantId,
      ),
  ]);

  if (
    neighborUpdate.error ||
    currentUpdate.error
  ) {
    error(
      neighborUpdate.error
        ?.message ??
        currentUpdate.error
          ?.message ??
        "Não foi possível alterar a ordem.",
    );
  }

  revalidateGallery();
}

/* ========================================
   GALERIA
======================================== */

export async function addGallery(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const imageFile =
    getFile(
      formData,
      "image",
    );

  if (!imageFile) {
    error(
      "Selecione uma imagem.",
    );
  }

  const uploaded =
    await uploadImage(
      imageFile,
      `nelled-business/${currentTenant.tenant.slug}/gallery`,
    );

  if (!uploaded) {
    error(
      "Não foi possível enviar a imagem.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: last,
    error: positionError,
  } = await supabase
    .from("gallery_items")
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

  if (positionError) {
    await deleteImage(
      uploaded.public_id,
    );

    error(
      positionError.message,
    );
  }

  const {
    error: insertError,
  } = await supabase
    .from("gallery_items")
    .insert({
      tenant_id:
        currentTenant.tenant.id,

      title:
        text(
          formData,
          "title",
        ),

      description:
        text(
          formData,
          "description",
        ),

      alt_text:
        text(
          formData,
          "alt_text",
        ),

      image_url:
        uploaded.secure_url,

      image_public_id:
        uploaded.public_id,

      position:
        (last?.position ??
          -1) + 1,

      is_active:
        checked(
          formData,
          "is_active",
        ),

      is_featured:
        checked(
          formData,
          "is_featured",
        ),
    });

  if (insertError) {
    await deleteImage(
      uploaded.public_id,
    );

    error(insertError.message);
  }

  revalidateGallery();

  success(
    "Foto adicionada com sucesso.",
  );
}

export async function updateGallery(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  if (!id) {
    error(
      "Foto inválida.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: current,
    error: currentError,
  } = await supabase
    .from("gallery_items")
    .select(
      `
        id,
        image_public_id
      `,
    )
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .maybeSingle();

  if (
    currentError ||
    !current
  ) {
    error(
      currentError?.message ??
        "Foto não encontrada.",
    );
  }

  const newFile =
    getFile(
      formData,
      "image",
    );

  const newImage =
    newFile
      ? await uploadImage(
          newFile,
          `nelled-business/${currentTenant.tenant.slug}/gallery`,
        )
      : null;

  const payload: {
    title: string | null;
    description:
      | string
      | null;
    alt_text: string | null;
    is_active: boolean;
    is_featured: boolean;
    image_url?: string;
    image_public_id?: string;
  } = {
    title:
      text(
        formData,
        "title",
      ),

    description:
      text(
        formData,
        "description",
      ),

    alt_text:
      text(
        formData,
        "alt_text",
      ),

    is_active:
      checked(
        formData,
        "is_active",
      ),

    is_featured:
      checked(
        formData,
        "is_featured",
      ),
  };

  if (newImage) {
    payload.image_url =
      newImage.secure_url;

    payload.image_public_id =
      newImage.public_id;
  }

  const {
    error: updateError,
  } = await supabase
    .from("gallery_items")
    .update(payload)
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (updateError) {
    if (newImage) {
      await deleteImage(
        newImage.public_id,
      );
    }

    error(updateError.message);
  }

  if (
    newImage &&
    current.image_public_id
  ) {
    await deleteImage(
      current.image_public_id,
    );
  }

  revalidateGallery();

  success(
    "Foto atualizada com sucesso.",
  );
}

export async function toggleGallery(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  const currentValue =
    String(
      formData.get(
        "is_active",
      ) ?? "",
    ) === "true";

  const supabase =
    await createClient();

  const { error: updateError } =
    await supabase
      .from("gallery_items")
      .update({
        is_active:
          !currentValue,
      })
      .eq("id", id)
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      );

  if (updateError) {
    error(updateError.message);
  }

  revalidateGallery();
}

export async function toggleGalleryFeatured(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  const currentValue =
    String(
      formData.get(
        "is_featured",
      ) ?? "",
    ) === "true";

  const supabase =
    await createClient();

  const { error: updateError } =
    await supabase
      .from("gallery_items")
      .update({
        is_featured:
          !currentValue,
      })
      .eq("id", id)
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      );

  if (updateError) {
    error(updateError.message);
  }

  revalidateGallery();
}

export async function moveGallery(
  formData: FormData,
) {
  const id =
    String(
      formData.get("id") ??
        "",
    );

  const direction =
    String(
      formData.get(
        "direction",
      ) ?? "",
    );

  if (
    direction !== "up" &&
    direction !== "down"
  ) {
    return;
  }

  await moveItem(
    "gallery_items",
    id,
    direction,
  );
}

export async function deleteGallery(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  const supabase =
    await createClient();

  const {
    data,
    error: queryError,
  } = await supabase
    .from("gallery_items")
    .select(
      "image_public_id",
    )
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .maybeSingle();

  if (queryError) {
    error(queryError.message);
  }

  const {
    error: deleteError,
  } = await supabase
    .from("gallery_items")
    .delete()
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (deleteError) {
    error(deleteError.message);
  }

  if (
    data?.image_public_id
  ) {
    await deleteImage(
      data.image_public_id,
    );
  }

  revalidateGallery();

  success(
    "Foto excluída com sucesso.",
  );
}

/* ========================================
   ANTES E DEPOIS
======================================== */

export async function addBeforeAfter(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const beforeFile =
    getFile(
      formData,
      "before",
    );

  const afterFile =
    getFile(
      formData,
      "after",
    );

  if (
    !beforeFile ||
    !afterFile
  ) {
    error(
      "Selecione as imagens de antes e depois.",
    );
  }

  const folder =
    `nelled-business/${currentTenant.tenant.slug}/before-after`;

  const [
    before,
    after,
  ] = await Promise.all([
    uploadImage(
      beforeFile,
      folder,
    ),

    uploadImage(
      afterFile,
      folder,
    ),
  ]);

  if (!before || !after) {
    if (before) {
      await deleteImage(
        before.public_id,
      );
    }

    if (after) {
      await deleteImage(
        after.public_id,
      );
    }

    error(
      "Não foi possível enviar as imagens.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: last,
    error: positionError,
  } = await supabase
    .from(
      "before_after_items",
    )
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

  if (positionError) {
    await Promise.all([
      deleteImage(
        before.public_id,
      ),
      deleteImage(
        after.public_id,
      ),
    ]);

    error(
      positionError.message,
    );
  }

  const {
    error: insertError,
  } = await supabase
    .from(
      "before_after_items",
    )
    .insert({
      tenant_id:
        currentTenant.tenant.id,

      title:
        text(
          formData,
          "title",
        ),

      description:
        text(
          formData,
          "description",
        ),

      before_image_url:
        before.secure_url,

      before_image_public_id:
        before.public_id,

      after_image_url:
        after.secure_url,

      after_image_public_id:
        after.public_id,

      position:
        (last?.position ??
          -1) + 1,

      is_active:
        checked(
          formData,
          "is_active",
        ),

      is_featured:
        checked(
          formData,
          "is_featured",
        ),
    });

  if (insertError) {
    await Promise.all([
      deleteImage(
        before.public_id,
      ),
      deleteImage(
        after.public_id,
      ),
    ]);

    error(insertError.message);
  }

  revalidateGallery();

  success(
    "Comparação adicionada com sucesso.",
  );
}

export async function updateBeforeAfter(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  if (!id) {
    error(
      "Comparação inválida.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: current,
    error: currentError,
  } = await supabase
    .from(
      "before_after_items",
    )
    .select(
      `
        before_image_public_id,
        after_image_public_id
      `,
    )
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .maybeSingle();

  if (
    currentError ||
    !current
  ) {
    error(
      currentError?.message ??
        "Comparação não encontrada.",
    );
  }

  const beforeFile =
    getFile(
      formData,
      "before",
    );

  const afterFile =
    getFile(
      formData,
      "after",
    );

  const folder =
    `nelled-business/${currentTenant.tenant.slug}/before-after`;

  const [
    newBefore,
    newAfter,
  ] = await Promise.all([
    beforeFile
      ? uploadImage(
          beforeFile,
          folder,
        )
      : Promise.resolve(null),

    afterFile
      ? uploadImage(
          afterFile,
          folder,
        )
      : Promise.resolve(null),
  ]);

  const payload: {
    title: string | null;
    description:
      | string
      | null;
    is_active: boolean;
    is_featured: boolean;

    before_image_url?: string;
    before_image_public_id?: string;

    after_image_url?: string;
    after_image_public_id?: string;
  } = {
    title:
      text(
        formData,
        "title",
      ),

    description:
      text(
        formData,
        "description",
      ),

    is_active:
      checked(
        formData,
        "is_active",
      ),

    is_featured:
      checked(
        formData,
        "is_featured",
      ),
  };

  if (newBefore) {
    payload.before_image_url =
      newBefore.secure_url;

    payload.before_image_public_id =
      newBefore.public_id;
  }

  if (newAfter) {
    payload.after_image_url =
      newAfter.secure_url;

    payload.after_image_public_id =
      newAfter.public_id;
  }

  const {
    error: updateError,
  } = await supabase
    .from(
      "before_after_items",
    )
    .update(payload)
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (updateError) {
    await Promise.all([
      newBefore
        ? deleteImage(
            newBefore.public_id,
          )
        : Promise.resolve(),

      newAfter
        ? deleteImage(
            newAfter.public_id,
          )
        : Promise.resolve(),
    ]);

    error(updateError.message);
  }

  await Promise.all([
    newBefore &&
    current.before_image_public_id
      ? deleteImage(
          current.before_image_public_id,
        )
      : Promise.resolve(),

    newAfter &&
    current.after_image_public_id
      ? deleteImage(
          current.after_image_public_id,
        )
      : Promise.resolve(),
  ]);

  revalidateGallery();

  success(
    "Comparação atualizada com sucesso.",
  );
}

export async function toggleBeforeAfter(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  const currentValue =
    String(
      formData.get(
        "is_active",
      ) ?? "",
    ) === "true";

  const supabase =
    await createClient();

  const { error: updateError } =
    await supabase
      .from(
        "before_after_items",
      )
      .update({
        is_active:
          !currentValue,
      })
      .eq("id", id)
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      );

  if (updateError) {
    error(updateError.message);
  }

  revalidateGallery();
}

export async function toggleBeforeAfterFeatured(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  const currentValue =
    String(
      formData.get(
        "is_featured",
      ) ?? "",
    ) === "true";

  const supabase =
    await createClient();

  const { error: updateError } =
    await supabase
      .from(
        "before_after_items",
      )
      .update({
        is_featured:
          !currentValue,
      })
      .eq("id", id)
      .eq(
        "tenant_id",
        currentTenant.tenant.id,
      );

  if (updateError) {
    error(updateError.message);
  }

  revalidateGallery();
}

export async function moveBeforeAfter(
  formData: FormData,
) {
  const id =
    String(
      formData.get("id") ??
        "",
    );

  const direction =
    String(
      formData.get(
        "direction",
      ) ?? "",
    );

  if (
    direction !== "up" &&
    direction !== "down"
  ) {
    return;
  }

  await moveItem(
    "before_after_items",
    id,
    direction,
  );
}

export async function deleteBeforeAfter(
  formData: FormData,
) {
  const currentTenant =
    await getCurrentTenant();

  if (!currentTenant) {
    redirect("/admin/login");
  }

  const id =
    String(
      formData.get("id") ??
        "",
    );

  const supabase =
    await createClient();

  const {
    data,
    error: queryError,
  } = await supabase
    .from(
      "before_after_items",
    )
    .select(
      `
        before_image_public_id,
        after_image_public_id
      `,
    )
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    )
    .maybeSingle();

  if (queryError) {
    error(queryError.message);
  }

  const {
    error: deleteError,
  } = await supabase
    .from(
      "before_after_items",
    )
    .delete()
    .eq("id", id)
    .eq(
      "tenant_id",
      currentTenant.tenant.id,
    );

  if (deleteError) {
    error(deleteError.message);
  }

  await Promise.all([
    data?.before_image_public_id
      ? deleteImage(
          data.before_image_public_id,
        )
      : Promise.resolve(),

    data?.after_image_public_id
      ? deleteImage(
          data.after_image_public_id,
        )
      : Promise.resolve(),
  ]);

  revalidateGallery();

  success(
    "Comparação excluída com sucesso.",
  );
}