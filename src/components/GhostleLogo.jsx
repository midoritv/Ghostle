export default function GhostleLogo({ className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src="/logo.png"
        alt="Ghostle"
        className="h-24 w-auto object-contain drop-shadow-[0_0_16px_rgba(123,110,224,0.55)]"
        draggable={false}
      />
    </div>
  );
}
