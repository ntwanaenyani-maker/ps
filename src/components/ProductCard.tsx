import React from 'react';
import { Product, Currency } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { Heart, Eye, Plus, Check, Star, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currency,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [isAddedRecently, setIsAddedRecently] = React.useState(false);
  const [currentImgIndex, setCurrentImgIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  const images = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.additionalImages) {
      product.additionalImages.forEach((img) => {
        if (img && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    return list.length > 0 ? list : [product.image];
  }, [product.image, product.additionalImages]);

  const activeImage = images[currentImgIndex] || product.image;

  React.useEffect(() => {
    setCurrentImgIndex(0);
  }, [product.id]);

  React.useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => window.clearInterval(timer);
  }, [images.length, isPaused]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAddedRecently(true);
    setTimeout(() => setIsAddedRecently(false), 1400);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <article
      onClick={() => onQuickView(product)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="product-card-root group relative flex flex-col bg-white border border-stone-200/80 rounded-xs overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-xl hover:border-emerald-800/30 hover:-translate-y-1"
    >
      {/* Product Image Stage (65-75% visual dominance) with Slider */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden select-none">
        <img
          src={activeImage}
          alt={`${product.name} - slide ${currentImgIndex + 1}`}
          className="product-card-image w-full h-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-108 will-change-transform"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Subtle stone/botanical overlay on hover */}
        <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-emerald-950/5 transition-colors duration-400 pointer-events-none" />

        {/* Slider Navigation Chevrons (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none z-10">
            <button
              onClick={handlePrevImage}
              aria-label="Previous product image"
              className="pointer-events-auto p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 shadow-md backdrop-blur-xs transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextImage}
              aria-label="Next product image"
              className="pointer-events-auto p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 shadow-md backdrop-blur-xs transition-opacity duration-200 opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Slider Pagination Dots (if multiple images) */}
        {images.length > 1 && (
          <div className="absolute bottom-13 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIndex(idx);
                }}
                aria-label={`View image ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 pointer-events-auto cursor-pointer ${
                  currentImgIndex === idx ? 'w-4 bg-stone-900 shadow-xs' : 'w-1.5 bg-stone-400/80 hover:bg-stone-700'
                }`}
              />
            ))}
          </div>
        )}

        {/* Top Floating Actions: Wishlist & Edition Tag */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono tracking-wider text-stone-700 uppercase bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-xs shadow-2xs">
              {product.edition}
            </span>
            {images.length > 1 && (
              <span className="text-[10px] font-mono font-medium text-stone-600 bg-white/90 backdrop-blur-xs px-1.5 py-0.5 rounded-xs shadow-2xs">
                {currentImgIndex + 1}/{images.length}
              </span>
            )}
          </div>

          <button
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`pointer-events-auto p-2 rounded-full transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-600 shadow-sm'
                : 'bg-white/85 text-stone-600 hover:bg-white hover:text-stone-950 shadow-2xs'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Hover Quick Actions Drawer */}
        <div className="absolute bottom-3 inset-x-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 bg-stone-900/90 hover:bg-stone-900 text-white text-xs font-medium uppercase tracking-wider rounded-xs backdrop-blur-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Examine</span>
          </button>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`py-2 px-3 rounded-xs text-xs font-medium uppercase tracking-wider backdrop-blur-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm ${
              isOutOfStock
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-emerald-700 text-white'
                : 'bg-white hover:bg-stone-100 text-stone-900'
            }`}
            title="Instant Add to Bag"
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bag</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Metadata & Price Zone */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Unboxed Metadata: Vendor & Grams/Type */}
          <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-stone-500 mb-1.5">
            <span className="text-emerald-800 font-semibold truncate max-w-[150px]">{product.vendor || product.category}</span>
            <span className="text-stone-500 shrink-0 font-medium">{product.grams ? `${product.grams}g` : product.type || product.dimensions}</span>
          </div>

          {/* Product Title */}
          <h3 className="text-base font-bold text-stone-900 font-serif group-hover:text-emerald-800 transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Tagline */}
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>

          {/* Star Rating and Appraisals count */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-mono text-xs font-semibold text-stone-900">{product.rating}</span>
            <span className="text-stone-400 text-[11px] font-mono">({product.reviewCount} reviews)</span>
            {product.sku && (
              <span className="ml-auto text-[10px] font-mono text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded-xs">
                {product.sku}
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Stock Status Bottom Row */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          {/* Price with Tabular Numerals */}
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold font-mono tabular-nums text-stone-950">
              {formatPrice(product.price, currency)}
            </span>
            {product.originalPrice && (
              <span className="text-xs font-mono tabular-nums text-stone-400 line-through">
                {formatPrice(product.originalPrice, currency)}
              </span>
            )}
          </div>

          {/* Stock Status Indicator */}
          <div className="text-[11px] font-mono text-stone-500">
            {isOutOfStock ? (
              <span className="text-stone-400">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-medium">Only {product.stock} left</span>
            ) : (
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                In Stock (SA)
              </span>
            )}
          </div>
        </div>

        {/* Mockup Screen 2 Action Buttons: Add to Cart (Forest Green) & WhatsApp */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex-1 py-2.5 px-3 rounded-xs text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
              isOutOfStock
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : isAddedRecently
                ? 'bg-emerald-700 text-white'
                : 'bg-[#1f3d2e] hover:bg-[#152c21] text-white'
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          <a
            href={`https://wa.me/27723819402?text=${encodeURIComponent(
              `Dumela Phethagatsa Solutions! 🇿🇦 I would like to order "${product.name}" (${formatPrice(product.price, currency)}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title="Order directly via WhatsApp"
            className="p-2.5 rounded-xs border border-emerald-800/40 text-emerald-800 hover:bg-emerald-50 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-emerald-700" />
          </a>
        </div>
      </div>
    </article>
  );
};
