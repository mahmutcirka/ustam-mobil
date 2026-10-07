// Arıza fotoğrafını cihazda küçültür (en uzun kenar 800px, JPEG %70) — localStorage'a sığacak boyuta indirir.
// Fotoğraf hiçbir sunucuya gönderilmez.
export async function fotoKucult(dosya: File, maxKenar = 800, kalite = 0.7): Promise<string> {
  const resim = await createImageBitmap(dosya);
  const oran = Math.min(1, maxKenar / Math.max(resim.width, resim.height));
  const tuval = document.createElement("canvas");
  tuval.width = Math.round(resim.width * oran);
  tuval.height = Math.round(resim.height * oran);
  tuval.getContext("2d")!.drawImage(resim, 0, 0, tuval.width, tuval.height);
  resim.close();
  return tuval.toDataURL("image/jpeg", kalite);
}
