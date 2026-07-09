import { IconButton } from '../common/IconButton';
import backIcon from '../../assets/icons/back.svg';
import searchIcon from '../../assets/icons/search.svg';
import wishlistIcon from '../../assets/icons/wishlist.svg';
import shareIcon from '../../assets/icons/share.svg';

/**
 * Header
 * Absolutely-positioned overlay that groups the status-bar safe area and the
 * 56px header bar, sharing a top-down white→transparent gradient so page
 * content scrolls underneath and fades out behind the controls.
 */
export default function Header({ onBack, onSearch, onWishlist, onShare }) {
  return (
    <header
      data-id="header"
      className="fixed left-1/2 top-0 z-20 flex w-full max-w-md -translate-x-1/2 flex-col"
      style={{
        background:
          'linear-gradient(180deg, #FFFFFF 40%, rgba(255, 255, 255, 0) 100%)',
      }}
    >
      {/* Safe area — reserves the real device status-bar inset (0 when there
          is none; no artificial fallback height). */}
      <div
        data-id="header-safe-area"
        className="w-full shrink-0"
        style={{ height: 'env(safe-area-inset-top, 0px)' }}
      />

      {/* Header stack — 56px row, back on the left, actions on the right. */}
      <div
        data-id="header-stack"
        className="flex h-14 items-center gap-2 px-3 py-2"
      >
        <IconButton
          dataId="header-back-button"
          icon={backIcon}
          label="Back"
          onPress={onBack}
        />

        <div data-id="header-actions" className="ml-auto flex items-center gap-2">
          <IconButton
            dataId="header-search-button"
            icon={searchIcon}
            label="Search"
            onPress={onSearch}
          />
          <IconButton
            dataId="header-wishlist-button"
            icon={wishlistIcon}
            label="Wishlist"
            onPress={onWishlist}
          />
          <IconButton
            dataId="header-share-button"
            icon={shareIcon}
            label="Share"
            onPress={onShare}
          />
        </div>
      </div>
    </header>
  );
}
