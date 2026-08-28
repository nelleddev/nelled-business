import "server-only";
import { cloudinary } from "./config";
export async function uploadImage(file: File, folder: string) {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("Arquivo precisa ser uma imagem.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Imagem deve ter no máximo 10 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  return await new Promise<{secure_url:string; public_id:string}>((resolve,reject)=>{
    const stream=cloudinary.uploader.upload_stream({folder,resource_type:"image"},(error,result)=>{
      if(error||!result) return reject(error ?? new Error("Falha no upload"));
      resolve({secure_url:result.secure_url,public_id:result.public_id});
    });
    stream.end(buffer);
  });
}
export async function deleteImage(publicId?: string|null){ if(publicId) await cloudinary.uploader.destroy(publicId); }
