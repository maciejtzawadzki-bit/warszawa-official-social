// Ruch sieciowy narzędzi przez proxy środowiska. W chmurze warszawa_official część adresów (np. Supabase panelu KMZ)
// rozwiązuje się tylko przez proxy z HTTPS_PROXY, a wbudowany fetch Node'a domyślnie je pomija (automat 14.10:
// reakcje.mjs → „fetch failed”, ENOTFOUND). Node włącza proxy dla fetch tylko przy starcie (NODE_USE_ENV_PROXY=1),
// więc gdy proxy jest ustawione, a ta zmienna nie, uruchamiamy ten sam skrypt jeszcze raz z nią i kończymy jego kodem.
// Importuj jako pierwszy w każdym skrypcie uruchamianym z wiersza poleceń.
import { spawnSync } from "node:child_process";

const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
if (proxy && !process.env.NODE_USE_ENV_PROXY) {
  const wynik = spawnSync(process.execPath, ["--disable-warning=UNDICI-EHPA", ...process.execArgv, ...process.argv.slice(1)], {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1" },
  });
  if (wynik.error) throw wynik.error;
  process.exit(wynik.status ?? 1);
}
