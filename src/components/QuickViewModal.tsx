import React, { useState, useEffect } from 'react';
import { Product, Currency, ProductVariant, UserAccount } from '../types/store';
import { formatPrice } from '../utils/formatters';
import { dbService } from '../services/db';
import { ProductReviewsSection } from './ProductReviewsSection';
import { RelatedProducts } from './RelatedProducts';
import { X, Heart, Plus, Minus, Check, Star, ShieldCheck, Truck, ChevronDown, ChevronUp, Share2, ChevronLeft, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  currency: Currency;
  isWishlisted: boolean;
  currentUser: UserAccount | null;
  onClose: () => void;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, quantity: number, variantId?: string) => void;
  onSelectProduct: (product: Product) => void;
  onRequireLogin: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  currency,
  isWishlisted,
  currentUser,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onRequireLogin,
}) => {
  if (!product) return null;

  const [activeImage, setActiveImage] = useState(product.image);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'craft' | 'specs' | 'delivery' | null>('specs');
  const [isGalleryPaused, setIsGalleryPaused] = useState(false);

  const relatedProducts = dbService.getRelatedProducts(product.id, 4);
  const reviewBreakdown = dbService.getReviewBreakdown(product.id);

  useEffect(() => {
    setActiveImage(product.image);
    setSelectedVariant(product.variants[0]);
    setQuantity(1);
    setAddedNotice(false);
    setWishlistNotice(false);
  }, [product]);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedVariant?.id);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
  };

  const handleWishlistClick = () => {
    onToggleWishlist(product.id);
    setWishlistNotice(true);
    setTimeout(() => setWishlistNotice(false), 2000);
  };

  const handleScrollToReviews = () => {
    const el = document.getElementById('product-reviews-container');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const galleryImages = React.useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (product.additionalImages) {
      product.additionalImages.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : [product.image];
  }, [product.image, product.additionalImages]);

  const currentIndex = galleryImages.indexOf(activeImage) >= 0 ? galleryImages.indexOf(activeImage) : 0;

  const handlePrevSlide = () => {
    const newIdx = currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1;
    setActiveImage(galleryImages[newIdx]);
  };

  const handleNextSlide = () => {
    const newIdx = currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1;
    setActiveImage(galleryImages[newIdx]);
  };

  useEffect(() => {
    if (galleryImages.length <= 1 || isGalleryPaused) return;
    const timer = window.setInterval(() => {
      setActiveImage((prev) => {
        const idx = galleryImages.indexOf(prev);
        return galleryImages[(idx + 1) % galleryImages.length];
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [galleryImages, isGalleryPaused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevSlide();
      if (e.key === 'ArrowRight') handleNextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryImages, currentIndex]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative w-full max-w-5xl bg-white border border-stone-200 shadow-2xl rounded-xs overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product view"
          className="absolute top-4 right-4 z-20 p-2 text-stone-500 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="max-h-[88vh] overflow-y-auto">
          {/* Main Top Section: Gallery Left, Contiguous PDP Right */}
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-stone-200">
            {/* Left Column: Visual Gallery Stage with Interactive Slider */}
            <div className="p-6 sm:p-8 bg-stone-50/80 border-b md:border-b-0 md:border-r border-stone-200 flex flex-col justify-between">
              <div>
                {/* Main High-Res Image Viewport with Slider Controls */}
                <div className="relative aspect-[4/3] w-full bg-stone-200/50 rounded-xs overflow-hidden mb-4 border border-stone-200/60 shadow-2xs group select-none"
                  onMouseEnter={() => setIsGalleryPaused(true)}
                  onMouseLeave={() => setIsGalleryPaused(false)}
                >
                  <img
                    src={activeImage}
                    alt={`${product.name} - perspective ${currentIndex + 1}`}
                    className="w-full h-full object-cover object-center transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Edition Tag */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-mono text-stone-700 uppercase rounded-xs shadow-2xs">
                    {product.edition}
                  </div>

                  {/* Previous / Next Slider Chevrons */}
                  {galleryImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevSlide}
                        aria-label="Previous view"
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 shadow-md backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleNextSlide}
                        aria-label="Next view"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white text-stone-800 hover:text-stone-950 shadow-md backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Slide Counter */}
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-stone-900/85 backdrop-blur-xs text-stone-100 text-[11px] font-mono px-2 py-0.5 rounded-xs shadow-xs">
                      {currentIndex + 1} / {galleryImages.length}
                    </div>
                  )}

                  {/* Bottom Slider Dots */}
                  {galleryImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {galleryImages.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImage(img)}
                          aria-label={`View angle ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            currentIndex === idx ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/60 hover:bg-white'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Thumbnail Reel Slider */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`relative w-16 h-16 rounded-xs overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                          activeImage === img ? 'border-stone-900 scale-102 shadow-xs' : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Perspective ${idx + 1}`} className="w-full h-full object-cover" />
                        <span className="absolute bottom-0.5 right-1 text-[9px] font-mono bg-stone-950/70 text-stone-200 px-1 rounded-xs">
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Provenance note */}
              <div className="mt-6 pt-4 border-t border-stone-200/80 text-[11px] font-mono text-stone-500 flex items-center justify-between">
                <span>Artisan: {product.artisan}</span>
                <span>Certified Hand-Finished</span>
              </div>
            </div>

            {/* Right Column: Contiguous Purchase Module */}
            <div className="p-6 sm:p-8 flex flex-col justify-between">
              <div>
                {/* Vendor, Category, SKU & Stock */}
                <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-stone-500 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-xs">
                      {product.vendor || 'Phethagatsa Organics'}
                    </span>
                    <span>·</span>
                    <span>{product.type || product.category}</span>
                  </div>
                  <span className={product.stock <= 5 ? 'text-amber-800 font-semibold' : 'text-emerald-700 font-semibold flex items-center gap-1'}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {product.stock > 0 ? `${product.stock} In Stock (SA)` : 'Out of Stock'}
                  </span>
                </div>

                {/* Title & Tagline */}
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-950 font-serif">
                  {product.name}
                </h2>
                <p className="mt-1.5 text-xs text-stone-500 font-sans leading-relaxed">
                  {product.tagline}
                </p>

                {/* Tags and Attributes */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  {product.sku && (
                    <span className="text-[10px] font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-xs">
                      SKU: {product.sku}
                    </span>
                  )}
                  {product.grams && (
                    <span className="text-[10px] font-mono text-stone-600 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-xs">
                      Net: {product.grams}g
                    </span>
                  )}
                  {product.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono text-emerald-800 bg-emerald-50/80 border border-emerald-200/50 px-2 py-0.5 rounded-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Prominent Average Rating Header Link */}
                <div
                  onClick={handleScrollToReviews}
                  className="flex items-center gap-2 mt-3 text-xs text-stone-700 cursor-pointer group hover:opacity-85"
                >
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= Math.round(reviewBreakdown.average) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-stone-950 font-bold text-sm">
                    {reviewBreakdown.average}
                  </span>
                  <span className="text-stone-400">·</span>
                  <span className="font-mono text-stone-600 underline group-hover:text-stone-950">
                    {reviewBreakdown.total} Verified Reviews
                  </span>
                </div>

                {/* Benefits Badges (From Mockup Screen 3) */}
                <div className="flex flex-wrap items-center gap-2 mt-3.5">
                  {(product.benefits || ['Hydrating', 'Nourishing', 'All Skin Types']).map((benefit, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200/80 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-gold-accent shrink-0" />
                      <span>{benefit}</span>
                    </span>
                  ))}
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono text-stone-600 bg-stone-100 border border-stone-200">
                    🚚 2–5 days delivery (SA)
                  </span>
                </div>

                {/* Price Display */}
                <div className="mt-4 pb-4 border-b border-stone-200 flex items-baseline gap-3">
                  <span className="text-2xl font-bold font-mono tabular-nums text-stone-950">
                    {formatPrice(product.price, currency)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-mono tabular-nums text-stone-400 line-through">
                      {formatPrice(product.originalPrice, currency)}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-stone-500 uppercase">VAT Included · Doorstep Courier</span>
                </div>

                {/* Rich Description or Body HTML */}
                {product.bodyHtml ? (
                  <div
                    className="mt-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans prose prose-stone max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>ul>li]:mb-1 [&>p>strong]:text-stone-900"
                    dangerouslySetInnerHTML={{ __html: product.bodyHtml }}
                  />
                ) : (
                  <p className="mt-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                    {product.description}
                  </p>
                )}

                {/* Finish / Material Variant Selector */}
                {product.variants.length > 0 && (
                  <div className="mt-5">
                    <div className="text-xs font-mono uppercase tracking-wider text-stone-700 mb-2 flex items-center justify-between">
                      <span>Select Finish: <strong className="text-stone-950 font-sans">{selectedVariant?.name}</strong></span>
                      {selectedVariant && !selectedVariant.inStock && (
                        <span className="text-rose-600 text-[11px]">Bespoke Order Only</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-xs border transition-all cursor-pointer flex items-center gap-2 ${
                            selectedVariant?.id === v.id
                              ? 'border-stone-950 bg-stone-950 text-white shadow-xs'
                              : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400'
                          }`}
                        >
                          {v.colorHex && (
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-stone-400/50 shrink-0"
                              style={{ backgroundColor: v.colorHex }}
                            />
                          )}
                          <span>{v.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper & Add to Bag & Add to Wishlist */}
                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center justify-center border border-stone-300 rounded-xs bg-stone-50 h-11">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="px-3 text-stone-600 hover:text-stone-950 disabled:opacity-30 cursor-pointer h-full"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-medium text-stone-950">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      className="px-3 text-stone-600 hover:text-stone-950 disabled:opacity-30 cursor-pointer h-full"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    onClick={handleAdd}
                    disabled={product.stock <= 0}
                    className={`flex-1 h-11 px-6 text-xs font-semibold uppercase tracking-wider rounded-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                      product.stock <= 0
                        ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                        : addedNotice
                        ? 'bg-emerald-800 text-white'
                        : 'bg-[#1f3d2e] hover:bg-[#152c21] text-white'
                    }`}
                  >
                    {addedNotice ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added to Cart</span>
                      </>
                    ) : (
                      <span>Add to Cart · {formatPrice(product.price * quantity, currency)}</span>
                    )}
                  </button>

                  {/* Product-Specific WhatsApp Order CTA */}
                  <a
                    href={`https://wa.me/27723819402?text=${encodeURIComponent(
                      `Dumela Phethagatsa Solutions! 🇿🇦 I'm interested in ordering "${product.name}" (Qty: ${quantity}${
                        selectedVariant ? `, Size: ${selectedVariant.name}` : ''
                      }, Total: ${formatPrice(product.price * quantity, currency)}). Please assist with my delivery.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-11 px-4 rounded-xs border-2 border-emerald-800/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                    title="Order this product directly over WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <span className="hidden sm:inline">WhatsApp Order</span>
                  </a>

                  {/* Prominent Add to Wishlist Button */}
                  <button
                    onClick={handleWishlistClick}
                    className={`h-11 px-3 sm:px-4 rounded-xs border transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-mono uppercase tracking-wider ${
                      isWishlisted
                        ? 'border-rose-300 bg-rose-50 text-rose-700 font-semibold'
                        : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-950'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
                    <span className="hidden sm:inline">{isWishlisted ? 'In Wishlist' : 'Wishlist'}</span>
                  </button>
                </div>

                {wishlistNotice && (
                  <p className="mt-2 text-[11px] font-mono text-stone-600 text-center sm:text-right">
                    {isWishlisted
                      ? '✓ Saved to your personal collector wishlist'
                      : 'Removed from personal wishlist'}
                  </p>
                )}

                {/* Informational Accordion */}
                <div className="mt-8 border-t border-stone-200 divide-y divide-stone-200 text-xs">
                  <div>
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                      className="w-full py-3 flex items-center justify-between text-left font-medium text-stone-900 cursor-pointer"
                    >
                      <span className="font-mono uppercase tracking-wider">Dimensions & Specifications</span>
                      {openAccordion === 'specs' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openAccordion === 'specs' && (
                      <div className="pb-3 text-stone-600 space-y-1.5 font-mono text-[11px]">
                        <div>Dimensions: <span className="text-stone-900">{product.dimensions}</span></div>
                        <div>Primary Materials: <span className="text-stone-900">{product.materials}</span></div>
                        <div>Studio Batch: <span className="text-stone-900">{product.edition}</span></div>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'craft' ? null : 'craft')}
                      className="w-full py-3 flex items-center justify-between text-left font-medium text-stone-900 cursor-pointer"
                    >
                      <span className="font-mono uppercase tracking-wider">Craftsmanship Details</span>
                      {openAccordion === 'craft' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openAccordion === 'craft' && (
                      <div className="pb-3 text-stone-600 space-y-1.5">
                        <ul className="list-disc list-inside space-y-1 text-stone-600">
                          {product.details.map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div>
                    <button
                      onClick={() => setOpenAccordion(openAccordion === 'delivery' ? null : 'delivery')}
                      className="w-full py-3 flex items-center justify-between text-left font-medium text-stone-900 cursor-pointer"
                    >
                      <span className="font-mono uppercase tracking-wider">White-Glove Delivery & Warranty</span>
                      {openAccordion === 'delivery' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {openAccordion === 'delivery' && (
                      <div className="pb-3 text-stone-600 space-y-2 text-[11px] leading-relaxed">
                        <div className="flex items-start gap-2">
                          <Truck className="w-3.5 h-3.5 text-stone-700 shrink-0 mt-0.5" />
                          <span>Insured courier delivery with scheduling confirmation 24h prior to arrival.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-stone-700 shrink-0 mt-0.5" />
                          <span>10-year structural warranty with complimentary atelier repair consultation.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Sections */}
          <div className="p-6 sm:p-10 bg-white">
            {/* RELATED PRODUCTS SECTION (Suggests 3-5 relevant items) */}
            <RelatedProducts
              relatedProducts={relatedProducts}
              currency={currency}
              onSelectProduct={onSelectProduct}
              onAddToCart={(p) => onAddToCart(p, 1)}
            />

            {/* CUSTOMER REVIEWS & RATING SYSTEM (Prominent Average Rating + Submission) */}
            <div id="product-reviews-container">
              <ProductReviewsSection
                productId={product.id}
                productName={product.name}
                currentUser={currentUser}
                onRequireLogin={onRequireLogin}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
