import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '画像ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // 圧縮設定を取得
    const quality = Number(formData.get('quality')) || 80;
    const format = (formData.get('format') as string) || 'jpeg';
    const maxWidth = Number(formData.get('maxWidth')) || 1920;
    const maxHeight = Number(formData.get('maxHeight')) || 1920;

    // ファイルをバッファに変換
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 画像情報を取得
    const metadata = await sharp(buffer).metadata();
    
    // 画像処理パイプラインを構築
    let pipeline = sharp(buffer);
    
    // リサイズが必要な場合
    if (metadata.width && metadata.width > maxWidth || 
        metadata.height && metadata.height > maxHeight) {
      pipeline = pipeline.resize({
        width: maxWidth,
        height: maxHeight,
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 出力フォーマットと品質を設定
    let outputBuffer;
    if (format === 'jpeg' || format === 'jpg') {
      outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
    } else if (format === 'png') {
      outputBuffer = await pipeline.png({ quality: Math.max(1, Math.floor(quality / 10)) }).toBuffer();
    } else if (format === 'webp') {
      outputBuffer = await pipeline.webp({ quality }).toBuffer();
    } else if (format === 'avif') {
      outputBuffer = await pipeline.avif({ quality }).toBuffer();
    } else {
      // デフォルトはJPEG
      outputBuffer = await pipeline.jpeg({ quality }).toBuffer();
    }
    
    // 圧縮率を計算
    const originalSize = buffer.length;
    const compressedSize = outputBuffer.length;
    const compressionRatio = (1 - (compressedSize / originalSize)) * 100;
    
    // レスポンスを返す
    return new NextResponse(outputBuffer, {
      headers: {
        'Content-Type': `image/${format}`,
        'Content-Disposition': `attachment; filename="compressed-image.${format}"`,
        'X-Original-Size': originalSize.toString(),
        'X-Compressed-Size': compressedSize.toString(),
        'X-Compression-Ratio': compressionRatio.toFixed(2)
      }
    });
    
  } catch (error) {
    console.error('画像圧縮処理中にエラーが発生しました:', error);
    return NextResponse.json(
      { error: '画像の処理中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
