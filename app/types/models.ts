import type { Id, IsoDate, Paginated } from './api';

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface Translation {
  id?: number;
  languageCode: string;
}

export interface NameTranslation extends Translation {
  name: string;
}

export interface Translatable<T extends Translation = NameTranslation> {
  translations: T[];
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export interface Color extends Translatable {
  id: Id;
  hexCode: string;
}

export interface Size extends Translatable {
  id: Id;
  type: string;
}

export interface Material extends Translatable {
  id: Id;
}

export interface Brand extends Translatable {
  id: Id;
  logo: string | null;
}

export interface CategoryTranslation extends NameTranslation {
  description: string | null;
}

export interface Category extends Translatable<CategoryTranslation> {
  id: Id;
  slug: string;
  image: string | null;
  ogImage: string | null;
  parentId: Id | null;
  isActive: boolean;
  showInHome: boolean;
  sectionOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  children?: Category[];
  createdAt?: IsoDate;
  updatedAt?: IsoDate;
}

/** Flat card used by home grids and category pages. */
export interface CategoryCard {
  id: Id;
  slug: string;
  image: string | null;
  name: string;
  sectionOrder: number;
  parentId: Id | null;
}

export interface ProductTranslation extends NameTranslation {
  shortDescription: string | null;
  longDescription: string | null;
  specifications: Record<string, string> | null;
}

export interface ProductVariant {
  id: Id;
  sku: string;
  /** `null` inherits the product price. */
  price: number | null;
  discountPrice: number | null;
  /** `null` shares the product stock. */
  stock: number | null;
  variantImages: string[] | null;
  productId?: Id;
  color: Color | null;
  size: Size | null;
  material: Material | null;
}

export interface Product extends Translatable<ProductTranslation> {
  id: Id;
  slug: string;
  basePrice: number;
  baseDiscountPrice: number | null;
  baseStock: number;
  weight: number;
  width: number | null;
  height: number | null;
  length: number | null;
  isFreeShipping: boolean;
  fixedShippingPrice: number | null;
  isActive: boolean;
  ratingsAverage: number;
  ratingsQuantity: number;
  mainImage: string;
  defaultGallery: string[];
  relatedProductsIds: Id[];
  relatedCategoryIds: Id[];
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogImage: string | null;
  brand: Brand | null;
  categories?: Category[];
  sliders?: { id: Id }[];
  variants: ProductVariant[];
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface CatalogFacets {
  colors: { id: Id; hex: string; name: string | null }[];
  sizes: { id: Id; value: string | null; type: string }[];
  materials: { id: Id; name: string | null }[];
  brands: { id: Id; name: string | null; logo: string | null }[];
  priceRange: { min: number; max: number };
}

export interface CatalogResult extends Paginated<Product> {
  filters: CatalogFacets;
}

export interface CategoryPage extends CatalogResult {
  category: {
    id: Id;
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: string | null;
    parent: { id: Id; slug: string; name: string } | null;
    children: CategoryCard[];
  };
}

/** Header search panel (`GET /products/suggest`). */
export interface SearchSuggestions {
  products: Product[];
  /** Every product matching the term. */
  total: number;
  categories: { id: Id; slug: string; name: string; image: string | null }[];
  brands: { id: Id; name: string; logo: string | null }[];
}

/** `relevance` (best match first) only applies while searching. */
export type ProductSort = 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'top_rated' | 'most_reviewed';

export interface ProductQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  categoryId?: Id;
  brandIds?: Id[];
  colorIds?: Id[];
  sizeIds?: Id[];
  materialIds?: Id[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: ProductSort;
}

export interface Review {
  id: Id;
  rating: number;
  comment: string | null;
  isVerifiedPurchase: boolean;
  user: { id: Id; name: string } | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

export interface ProductReviews {
  items: Review[];
  average: number;
  count: number;
  distribution: Record<'1' | '2' | '3' | '4' | '5', number>;
}

// ---------------------------------------------------------------------------
// Users & account
// ---------------------------------------------------------------------------

export type UserRole = 'user' | 'admin' | 'vendor' | 'employee';

export interface User {
  id: Id;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  vendorId?: Id | null;
  shiftStart?: string;
  shiftEnd?: string;
  baseSalary?: number;
  expectedWorkDays?: number;
  createdAt?: IsoDate;
  updatedAt?: IsoDate;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  user: User;
  vendorStatus: 'NONE' | 'PENDING' | 'ACTIVE';
}

export interface Governorate {
  id: Id;
  nameAr: string;
  nameEn: string;
  baseShippingCost: number;
  extraWeightFee: number;
  isActive: boolean;
}

export interface City {
  id: Id;
  nameAr: string;
  nameEn: string;
  baseShippingCost: number | null;
  extraWeightFee: number | null;
  isActive: boolean;
  governorate?: Governorate;
}

export interface Address {
  id: Id;
  addressName: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  landmark: string | null;
  isDefault: boolean;
  city: City;
  createdAt: IsoDate;
}

export type AddressInput = Omit<Address, 'id' | 'city' | 'createdAt' | 'landmark'> & {
  landmark?: string;
  cityId: Id;
};

export type NotificationStatus = 'success' | 'info' | 'warning' | 'error';

export interface AppNotification {
  id: Id;
  title: string;
  message: string;
  status: NotificationStatus;
  link: string | null;
  isRead: boolean;
  createdAt: IsoDate;
}

// ---------------------------------------------------------------------------
// Cart & orders
// ---------------------------------------------------------------------------

export interface CartLine {
  id: Id;
  quantity: number;
  unitPrice: number;
  unitDiscountPrice: number | null;
  effectivePrice: number;
  subTotal: number;
  availableStock: number;
  isAvailable: boolean;
  product: {
    id: Id;
    slug: string;
    mainImage: string;
    name: string;
    shortDescription: string | null;
  };
  productVariant: ProductVariant | null;
}

export interface Cart {
  items: CartLine[];
  itemsCount: number;
  totalQuantity: number;
  originalTotal: number;
  savings: number;
  total: number;
}

export interface CouponQuote {
  couponId: Id;
  code: string;
  discountAmount: number;
  finalAmount: number;
}

export interface CheckoutPreview {
  items: {
    productId: Id;
    variantId: Id | null;
    name: string;
    variantLabel: string | null;
    image: string;
    quantity: number;
    unitPrice: number;
    effectivePrice: number;
    lineTotal: number;
  }[];
  subTotal: number;
  shippingFee: number;
  shipping: {
    shippingFee: number;
    totalWeight: number;
    shipmentsCount: number;
    freeShippingApplied: boolean;
    rateUsed: { city: string; governorate: string; baseCost: number } | null;
  };
  coupon: CouponQuote | null;
  discountAmount: number;
  totalAmount: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'redelivery';

export type PaymentMethod = 'cod' | 'online';

export interface ShippingSnapshot {
  addressName: string;
  fullName: string;
  phoneNumber: string;
  streetAddress: string;
  landmark: string | null;
  cityId: Id;
  cityNameAr: string;
  cityNameEn: string;
  governorateNameAr: string;
  governorateNameEn: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  productName: string | null;
  productImage: string | null;
  sku: string | null;
  variantLabel: string | null;
  product: { id: Id; slug: string; mainImage: string } | null;
  variant?: ProductVariant | null;
}

export interface Order {
  id: Id;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subTotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string | null;
  trackingNumber: string | null;
  notes: string | null;
  shippingSnapshot: ShippingSnapshot | null;
  shippingAddress?: Address | null;
  items?: OrderItem[];
  itemsCount?: number;
  user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
  shippedAt: IsoDate | null;
  deliveredAt: IsoDate | null;
  cancelledAt: IsoDate | null;
  createdAt: IsoDate;
  updatedAt: IsoDate;
}

// ---------------------------------------------------------------------------
// Home page content
// ---------------------------------------------------------------------------

export interface MainSliderItem {
  id: Id;
  imageUrl: string;
  order: number;
  translations: (Translation & {
    title: string | null;
    buttonText: string | null;
    buttonLink: string | null;
  })[];
}

export interface MainSlider {
  id: Id;
  type: 'mainSlider';
  key: string;
  sectionOrder: number;
  isActive: boolean;
  showInHome: boolean;
  items: MainSliderItem[];
  createdAt: IsoDate;
}

export interface ProductSlider {
  id: Id;
  type: 'productSlider';
  key: string;
  sectionOrder: number;
  isActive: boolean;
  showInHome: boolean;
  translations: (Translation & { title: string })[];
  products: Product[];
  createdAt: IsoDate;
}

export interface FixedBanner {
  id: Id;
  type: 'fixedBanner';
  key: string;
  imageUrl: string;
  sectionOrder: number;
  isActive: boolean;
  showInHome: boolean;
  translations: (Translation & { title: string | null; link: string | null })[];
  createdAt: IsoDate;
}

export interface FullImage {
  id: Id;
  type: 'fullImage';
  key: string;
  imageUrl: string;
  isActive: boolean;
  showInHome: boolean;
  translations: (Translation & { link: string | null })[];
  createdAt: IsoDate;
}

export interface StaticSection {
  id: Id;
  type: 'staticSection';
  key: string;
  sectionOrder: number;
  isActive: boolean;
  createdAt: IsoDate;
}

export type HomeSectionType =
  | 'mainSlider'
  | 'productSlider'
  | 'fixedBanner'
  | 'fullImage'
  | 'staticSection'
  | 'CATEGORY_GRID';

interface HomeSectionBase<T extends HomeSectionType, D> {
  id: Id;
  type: T;
  section_key: string;
  sectionOrder: number;
  metadata: Record<string, unknown> | null;
  data: D[];
}

export type HomeSection =
  | HomeSectionBase<'mainSlider', MainSlider>
  | HomeSectionBase<'productSlider', ProductSlider>
  | HomeSectionBase<'fixedBanner', FixedBanner>
  | HomeSectionBase<'fullImage', FullImage>
  | HomeSectionBase<'staticSection', StaticSection>
  | HomeSectionBase<'CATEGORY_GRID', CategoryCard>;

export interface HomeSectionConfig {
  id: Id;
  section_key: string;
  type: HomeSectionType;
  sectionOrder: number;
  metadata: Record<string, unknown> | null;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: Id;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  expiryDate: IsoDate;
  /** 0 = unlimited */
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: IsoDate;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  activeOrders: number;
  todayOrders: number;
  revenue: number;
  salesByDay: { day: string; orders: number; revenue: number }[];
  recentOrders: Order[];
  products: number;
  users: number;
  categories: number;
}

export interface UploadedFile {
  filename: string;
  url: string;
  size?: number;
  mimetype?: string;
  createdAt?: IsoDate;
}
