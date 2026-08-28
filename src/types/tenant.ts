export type TenantStatus = "active" | "inactive" | "suspended";
export type TenantDomainType = "subdomain" | "custom";
export type TenantDomainStatus = "pending" | "verified" | "failed";
export interface Tenant { id:string; name:string; slug:string; status:TenantStatus; created_at:string; updated_at:string; }
export interface TenantSettings {
  id:string; tenant_id:string; company_name:string|null; short_name:string|null; slogan:string|null;
  logo_light_url:string|null; logo_dark_url:string|null; favicon_url:string|null;
  primary_color:string|null; secondary_color:string|null; accent_color:string|null;
  whatsapp:string|null; email:string|null; instagram_url:string|null; facebook_url:string|null; tiktok_url:string|null;
  instagram_username?:string|null; facebook_username?:string|null; tiktok_username?:string|null;
  city:string|null; state:string|null; service_area:string|null; service_cities?:string|null;
  hero_title:string|null; hero_description:string|null; hero_image_url:string|null; hero_eyebrow?:string|null; hero_secondary_text?:string|null;
  stat_1_value?:string|null; stat_1_label?:string|null; stat_2_value?:string|null; stat_2_label?:string|null; stat_3_value?:string|null; stat_3_label?:string|null;
  about_title:string|null; about_content:string|null; about_image_url?:string|null;
  seo_title:string|null; seo_description:string|null; created_at:string; updated_at:string;
}
export interface ResolvedTenant { tenant:Tenant; settings:TenantSettings|null; domain:string; isCustomDomain:boolean; }
