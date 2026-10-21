import type { Paginated } from '~/types/api';
import type {
  Brand,
  CatalogResult,
  Category,
  City,
  Color,
  Coupon,
  DashboardStats,
  FixedBanner,
  FullImage,
  Governorate,
  HomeSectionConfig,
  MainSlider,
  Material,
  Order,
  OrderStatus,
  Product,
  ProductQuery,
  ProductSlider,
  Size,
  StaticSection,
  UploadedFile,
  User,
} from '~/types/models';
import { createResource } from './resource';

export type UploadFolder = 'products' | 'categories' | 'brands' | 'sliders' | 'banners' | 'general';

/** Back-office endpoints (admin role required server-side). */
export function useAdminService() {
  const api = useApi();

  return {
    stats: () => api<DashboardStats>('/dashboard/stats'),

    products: {
      ...createResource<Product, Record<string, unknown>>(api, '/products'),
      list: (query: ProductQuery = {}) =>
        api<CatalogResult>('/products/admin/all', { query: toApiQuery({ ...query }) }),
      duplicate: (id: string) => api<Product>(`/products/${id}/duplicate`, { method: 'POST' }),
    },

    categories: {
      ...createResource<Category, Record<string, unknown>>(api, '/categories'),
      tree: () => api<Category[]>('/categories/admin/all'),
    },

    orders: {
      list: (query: { page?: number; limit?: number; status?: OrderStatus; search?: string } = {}) =>
        api<Paginated<Order>>('/orders/admin/all', { query: toApiQuery({ ...query }) }),
      get: (id: string) => api<Order>(`/orders/admin/${id}`),
      updateStatus: (id: string, body: { status: OrderStatus; trackingNumber?: string }) =>
        api<Order>(`/orders/admin/${id}/status`, { method: 'PATCH', body }),
      invoice: (id: string) => api<Blob>(`/orders/admin/${id}/invoice`, { raw: true }),
    },

    users: createResource<User, Record<string, unknown>>(api, '/users'),
    coupons: createResource<Coupon, Record<string, unknown>>(api, '/coupons'),

    colors: createResource<Color, Record<string, unknown>>(api, '/colors'),
    sizes: createResource<Size, Record<string, unknown>>(api, '/sizes'),
    materials: createResource<Material, Record<string, unknown>>(api, '/materials'),
    brands: createResource<Brand, Record<string, unknown>>(api, '/brands'),

    governorates: createResource<Governorate, Record<string, unknown>>(api, '/governorates', {
      listPath: '/governorates/admin/all',
    }),
    cities: createResource<City, Record<string, unknown>>(api, '/cities', {
      listPath: '/cities/admin/all',
    }),

    home: {
      configs: createResource<HomeSectionConfig, Record<string, unknown>>(api, '/home/configs'),
      reorder: (ids: string[]) =>
        api<HomeSectionConfig[]>('/home/configs/reorder', { method: 'PATCH', body: { ids } }),
      mainSliders: createResource<MainSlider, Record<string, unknown>>(api, '/main-sliders'),
      productSliders: createResource<ProductSlider, Record<string, unknown>>(api, '/sliders'),
      fixedBanners: createResource<FixedBanner, Record<string, unknown>>(api, '/fixed-banners'),
      fullImages: createResource<FullImage, Record<string, unknown>>(api, '/full-images'),
      staticSections: createResource<StaticSection, Record<string, unknown>>(api, '/static-sections'),
    },

    media: {
      upload: (folder: UploadFolder, files: File[]) => {
        const form = new FormData();
        files.forEach((file) => form.append('files', file));
        return api<UploadedFile[]>(`/media/upload/${folder}`, { method: 'POST', body: form });
      },
      list: (folder: UploadFolder) => api<UploadedFile[]>(`/media/list/${folder}`),
      remove: (folder: UploadFolder, fileName: string) =>
        api<{ deleted: true }>(`/media/delete/${folder}/${encodeURIComponent(fileName)}`, {
          method: 'DELETE',
        }),
    },
  };
}

export type AdminService = ReturnType<typeof useAdminService>;
