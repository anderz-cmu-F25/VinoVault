import { Wine } from "lucide-react";

export function DiscoverPage() {
  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Icon */}
        <div
          className="mb-8"
          style={{ opacity: 0.3 }}
        >
          <Wine
            className="w-20 h-20"
            style={{
              color: '#722F37',
              strokeWidth: 1
            }}
          />
        </div>

        {/* Heading */}
        <h1
          className="text-4xl mb-4 text-center"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#722F37',
            lineHeight: '1.2'
          }}
        >
          Discover Wines
        </h1>

        {/* Subtext */}
        <p
          className="text-base mb-10 text-center max-w-md"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#7A7A7A'
          }}
        >
          This feature is being built by our team and will be available soon.
        </p>
      </div>
    </main>
  );
}
