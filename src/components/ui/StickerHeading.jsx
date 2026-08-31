// Shared "sticker" style heading used across auth screens, the home page,
// and product/footer section titles: bold pink text with a white outline.
export default function StickerHeading({ as: Tag = 'h2', children, className = '' }) {
  return (
    <Tag
      className={`font-extrabold uppercase text-carissma-400 ${className}`}
      style={{
        textShadow:
          '2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff, 2px 2px 0 #fff, -2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff',
      }}
    >
      {children}
    </Tag>
  );
}
