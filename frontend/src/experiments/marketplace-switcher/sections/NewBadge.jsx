// "NEW" pill badge for marketplaces flagged `isNew` in data.js. Rendered
// inside a relatively-positioned tile: centred on the tile's bottom edge,
// overlapping it slightly.
import newBadge from '../../../assets/marketplace/new-badge.svg'

export default function NewBadge({ dataId }) {
  return (
    <img
      data-id={dataId}
      src={newBadge}
      alt="New"
      className="pointer-events-none absolute -bottom-[7px] left-1/2 z-10 h-[18px] w-auto -translate-x-1/2"
    />
  )
}
