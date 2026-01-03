import { X } from "lucide-react";

interface Props {
  src: string;
  onClose: () => void;
}

const ImagePreviewModal = ({ src, onClose }: Props) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={onClose} // 👈 click outside closes
    >
      <div
        className="
          relative
          w-[90vw]
          h-[90vh]
          flex
          items-center
          justify-center
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white z-10"
        >
          <X size={24} />
        </button>

        {/* IMAGE */}
        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()} // 👈 image click ignored
        />
      </div>
    </div>
  );
};

export default ImagePreviewModal;
