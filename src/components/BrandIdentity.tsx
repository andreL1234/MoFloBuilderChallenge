"use client";

import { useState } from "react";
import { Knowledge } from "@/types/knowledge";
import { resolveAssetUrl } from "@/utils/url";
import { SectionCard } from "@/components/ui";

// Raw values look like `font-family: "Open Sans", Arial, sans-serif` - keep just the primary family.
function cleanFontNames(fonts: string[] = []): string[] {
  const names = fonts
    .map((font) =>
      font
        .replace(/font-family:\s*/i, "")
        .split(",")[0]
        .replace(/!important/i, "")
        .replace(/["'}]/g, "")
        .trim()
    )
    .filter((name) => name.length > 0 && !name.startsWith("var(") && !["inherit", "initial"].includes(name));
  return [...new Set(names)];
}

// Pick readable label text for a swatch based on perceived brightness.
function isLightColor(hex: string): boolean {
  const value = hex.replace("#", "");
  if (value.length !== 6) return true;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function LogoTile({ src, alt, dark }: { src: string; alt: string; dark: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <a
      href={src.startsWith("data:") ? undefined : src}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex h-28 items-center justify-center rounded-2xl p-4 ring-1 transition hover:ring-brand-400 ${
        dark ? "bg-navy-900 ring-white/10" : "checkerboard ring-line"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- logos come from arbitrary scraped domains */}
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" onError={() => setFailed(true)} />
    </a>
  );
}

function ColorSwatch({ color }: { color: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(color);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. non-HTTPS); the hex is still visible to copy manually
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={`Copy ${color}`}
      className="group overflow-hidden rounded-2xl text-left ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-card"
    >
      <div
        className={`flex h-20 items-end p-2.5 text-xs font-medium ${isLightColor(color) ? "text-ink/70" : "text-white/85"}`}
        style={{ backgroundColor: color }}
      >
        <span className="opacity-0 transition group-hover:opacity-100">{copied ? "Copied" : "Copy"}</span>
      </div>
      <div className="bg-white px-3 py-2 font-mono text-xs text-ink">{color.toUpperCase()}</div>
    </button>
  );
}

export default function BrandIdentity({ knowledge }: { knowledge: Knowledge }) {
  const [darkBackdrop, setDarkBackdrop] = useState(false);
  const { brandingAndStyle } = knowledge;

  const logos = [
    ...new Set(
      (brandingAndStyle.logos || [])
        .map((src) => resolveAssetUrl(src, knowledge.sourceUrl))
        .filter((src): src is string => src !== null)
    ),
  ];
  const colors = brandingAndStyle.colors || [];
  const fonts = cleanFontNames(brandingAndStyle.fonts);

  return (
    <SectionCard
      title="Brand identity"
      description="Logos, colors, and type pulled from the site's HTML. Click a color to copy its hex code."
    >
      <div className="space-y-8">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-xs font-semibold tracking-wide text-muted uppercase">Logos</h4>
            {logos.length > 0 && (
              <div className="flex rounded-full bg-surface p-0.5 text-xs ring-1 ring-line">
                {[
                  { label: "Light", dark: false },
                  { label: "Dark", dark: true },
                ].map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setDarkBackdrop(option.dark)}
                    className={`rounded-full px-3 py-1 font-medium transition ${
                      darkBackdrop === option.dark ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {logos.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {logos.map((src) => (
                <LogoTile key={src} src={src} alt={`${knowledge.companyName} logo`} dark={darkBackdrop} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No logo images were found in the page markup.</p>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Color palette</h4>
          {colors.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {colors.map((color) => (
                <ColorSwatch key={color} color={color} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No hex colors were declared in the page markup.</p>
          )}
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">Typography</h4>
          {fonts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {fonts.map((font) => (
                <div key={font} className="rounded-2xl bg-surface p-4 ring-1 ring-line">
                  <p className="text-3xl text-ink" style={{ fontFamily: font }}>
                    Aa
                  </p>
                  <p className="mt-2 truncate text-sm font-medium text-ink">{font}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No font declarations were found in the page markup.</p>
          )}
        </div>
      </div>
    </SectionCard>
  );
}
