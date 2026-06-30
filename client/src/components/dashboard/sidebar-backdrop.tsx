interface SidebarBackdropProps {
  open: boolean;
  onClose: () => void;
}

export function SidebarBackdrop({ open, onClose }: SidebarBackdropProps) {
  if (!open) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 z-40 bg-black/25 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      aria-label="Close sidebar"
    />
  );
}
