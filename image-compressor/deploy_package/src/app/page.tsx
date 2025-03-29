import React from 'react';
import { Metadata } from 'next';
import ImageUploader from '@/components/ImageUploader';

export const metadata: Metadata = {
  title: '画像圧縮サービス',
  description: '大きなサイズの画像を簡単に圧縮できるWebサービス',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">画像圧縮サービス</h1>
        <p className="text-center mb-12">
          大きなサイズの画像を簡単に圧縮できるWebサービスです。<br />
          画像をドラッグ＆ドロップするか、ファイルを選択してください。
        </p>
        
        <ImageUploader />
        
        <footer className="mt-16 text-center text-gray-500">
          <p>© 2025 画像圧縮サービス</p>
        </footer>
      </div>
    </main>
  );
}
