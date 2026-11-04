import { useState, useRef } from "react";

function ImageUpload({ onImageSelect, image }) {
    const [internalFile, setInternalFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const currentFile = image !== undefined ? image : internalFile;

    const handleFile = (file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please upload a valid image file (PNG, JPG, or WEBP).");
            return;
        }

        if (image === undefined) {
            setInternalFile(file);
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        if (onImageSelect) {
            onImageSelect(file);
        }
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            handleFile(event.target.files[0]);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFile(event.dataTransfer.files[0]);
        }
    };

    const handleRemove = (event) => {
        event.stopPropagation();
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        if (image === undefined) {
            setInternalFile(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        if (onImageSelect) {
            onImageSelect(null);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "0 KB";
        const kb = bytes / 1024;
        if (kb > 1024) {
            return `${(kb / 1024).toFixed(2)} MB`;
        }
        return `${kb.toFixed(1)} KB`;
    };

    return (
        <div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
            />

            {previewUrl && currentFile ? (
                <div className="image-preview-container">
                    <img
                        src={previewUrl}
                        alt="Uploaded skin lesion preview"
                        className="image-preview"
                    />
                    <div className="preview-overlay">
                        <div>
                            <strong>{currentFile.name}</strong>
                            <span>{formatFileSize(currentFile.size)}</span>
                        </div>
                        <button
                            type="button"
                            className="remove-image"
                            onClick={handleRemove}
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    className="upload-area"
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={isDragging ? { borderColor: "#0d6efd", background: "#f0f7ff" } : {}}
                >
                    <div className="upload-icon">↑</div>
                    <h3>Upload Skin Image</h3>
                    <p>Click to browse or drag and drop image here</p>
                    <div className="upload-format">JPG, PNG, or WEBP (Max 10MB)</div>
                </div>
            )}
        </div>
    );
}

export default ImageUpload;
