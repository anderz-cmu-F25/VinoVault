import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;                  // 0 - 5, supports half stars
  onChange?: (next: number) => void;
  size?: number;                  // pixel size of each star
  readOnly?: boolean;
  label?: string;                 // optional accessible label
}

export function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
  label,
}: StarRatingProps) {
  const interactive = !readOnly && typeof onChange === "function";

  const handleClick = (index: number, half: boolean) => {
    if (!interactive) return;
    const next = half ? index - 0.5 : index;
    onChange?.(next);
  };

  return (
    <div
      className="inline-flex items-center gap-0.5"
      role={interactive ? "radiogroup" : "img"}
      aria-label={label || `Rating ${value} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = value >= i;
        const halfFilled = !filled && value >= i - 0.5;
        return (
          <span key={i} className="relative" style={{ width: size, height: size }}>
            <Star
              width={size}
              height={size}
              style={{
                color: filled ? "#C9A96E" : "#E0D8CC",
                fill: filled ? "#C9A96E" : "transparent",
                display: "block",
              }}
            />
            {halfFilled && (
              <Star
                width={size}
                height={size}
                style={{
                  color: "#C9A96E",
                  fill: "#C9A96E",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  clipPath: "inset(0 50% 0 0)",
                }}
              />
            )}
            {interactive && (
              <>
                <button
                  type="button"
                  aria-label={`${i - 0.5} stars`}
                  onClick={() => handleClick(i, true)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "50%",
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
                <button
                  type="button"
                  aria-label={`${i} stars`}
                  onClick={() => handleClick(i, false)}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "50%",
                    width: "50%",
                    height: "100%",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              </>
            )}
          </span>
        );
      })}
    </div>
  );
}
