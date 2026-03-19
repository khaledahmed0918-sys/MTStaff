import { NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function GET() {
  try {
    const [purchasesData, storeData] = await Promise.allSettled([
      fs.readFile('/root/mtcoins/data/coins_purchases.json', 'utf-8'),
      fs.readFile('/root/mtcoins/data/coinsstore.json', 'utf-8')
    ]);

    const purchases = purchasesData.status === 'fulfilled' ? JSON.parse(purchasesData.value).purchases || [] : [];
    const store = storeData.status === 'fulfilled' ? JSON.parse(storeData.value).items || [] : [];

    return NextResponse.json({
      purchases,
      store
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
