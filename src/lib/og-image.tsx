import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "Bible Atlas: a free map of biblical places, people and passages";

/** Shared 1200x630 card used by the opengraph and twitter image routes. */
export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#f3ecdc",
          color: "#2b2218",
          fontFamily: "Georgia, serif",
          borderTop: "12px solid #7a2e1f",
        }}
      >
        <div style={{ fontSize: 112, fontWeight: 700, display: "flex" }}>Bible Atlas</div>
        <div style={{ fontSize: 44, marginTop: 24, color: "#5f523f", display: "flex" }}>
          A free map of biblical places, people and passages, with honest confidence scores.
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
