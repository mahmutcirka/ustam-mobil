// localStorage yardımcıları — SSR'da ve erişim engellendiğinde sessizce varsayılana döner

export function oku<T>(anahtar: string, varsayilan: T): T {
  try {
    if (typeof localStorage === "undefined") return varsayilan;
    const ham = localStorage.getItem(anahtar);
    return ham === null ? varsayilan : (JSON.parse(ham) as T);
  } catch {
    return varsayilan;
  }
}

export function yaz(anahtar: string, deger: unknown) {
  try {
    if (deger === null || deger === undefined) localStorage.removeItem(anahtar);
    else localStorage.setItem(anahtar, JSON.stringify(deger));
  } catch {
    // depolama kullanılamıyorsa veri yalnızca bellekte kalır
  }
}
