"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';

interface CompressedImage {
  originalFile: File;
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  previewUrl: string;
}

const ImageUploader: React.FC = () => {
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressedImage, setCompressedImage] = useState<CompressedImage | null>(null);
  const [compressionOptions, setCompressionOptions] = useState({
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
  });

  const handleCompression = async (file: File) => {
    try {
      setIsCompressing(true);
      
      // 圧縮前のプレビューを生成
      const originalPreviewUrl = URL.createObjectURL(file);
      
      // 画像圧縮の実行
      const compressedFile = await imageCompression(file, compressionOptions);
      
      // 圧縮後のプレビューを生成
      const compressedPreviewUrl = URL.createObjectURL(compressedFile);
      
      // 圧縮結果の情報を設定
      setCompressedImage({
        originalFile: file,
        compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: (1 - compressedFile.size / file.size) * 100,
        previewUrl: compressedPreviewUrl,
      });
      
      setIsCompressing(false);
    } catch (error) {
      console.error('圧縮処理中にエラーが発生しました:', error);
      setIsCompressing(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      await handleCompression(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
  });

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quality = parseInt(e.target.value);
    setCompressionOptions(prev => ({
      ...prev,
      maxSizeMB: quality / 10,
    }));
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCompressionOptions(prev => ({
      ...prev,
      fileType: e.target.value,
    }));
  };

  const handleMaxDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dimension = parseInt(e.target.value);
    setCompressionOptions(prev => ({
      ...prev,
      maxWidthOrHeight: dimension,
    }));
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">圧縮設定</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">品質 (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              defaultValue="5"
              onChange={handleQualityChange}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">出力形式</label>
            <select
              onChange={handleFormatChange}
              className="w-full p-2 border rounded"
              defaultValue="image/jpeg"
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">最大サイズ (px)</label>
            <input
              type="number"
              min="100"
              max="4000"
              step="100"
              defaultValue="1920"
              onChange={handleMaxDimensionChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">ここにファイルをドロップ...</p>
        ) : (
          <div>
            <p className="mb-2">画像をドラッグ＆ドロップするか、クリックして選択</p>
            <p className="text-sm text-gray-500">対応形式: JPG, PNG, GIF, WebP</p>
          </div>
        )}
      </div>

      {isCompressing && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">圧縮処理中...</p>
        </div>
      )}

      {compressedImage && !isCompressing && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">圧縮結果</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border rounded p-4">
              <h3 className="text-lg font-medium mb-2">元の画像</h3>
              <p className="text-sm text-gray-500 mb-2">
                サイズ: {formatBytes(compressedImage.originalSize)}
              </p>
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={URL.createObjectURL(compressedImage.originalFile)}
                  alt="元の画像"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            
            <div className="border rounded p-4">
              <h3 className="text-lg font-medium mb-2">圧縮後の画像</h3>
              <p className="text-sm text-gray-500 mb-2">
                サイズ: {formatBytes(compressedImage.compressedSize)} 
                <span className="ml-2 text-green-500">
                  ({compressedImage.compressionRatio.toFixed(1)}% 削減)
                </span>
              </p>
              <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                <img
                  src={compressedImage.previewUrl}
                  alt="圧縮後の画像"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <a
              href={compressedImage.previewUrl}
              download={`compressed-${compressedImage.originalFile.name}`}
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded transition-colors"
            >
              圧縮画像をダウンロード
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
