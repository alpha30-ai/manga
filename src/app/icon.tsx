import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#09090B",
          borderRadius: "8px",
          border: "1px solid #27272A",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 16,
            fontFamily: "sans-serif",
            letterSpacing: "-1px",
          }}
        >
          <span style={{ color: "#FFFFFF" }}>A</span>
          <span style={{ color: "#FF334B", marginLeft: "1px" }}>M</span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "3px",
            width: "18px",
            height: "2px",
            background: "#FF334B",
            borderRadius: "1px",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
