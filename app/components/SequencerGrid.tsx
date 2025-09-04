"use client";

type SequencerGridProps = {
  numRows: number;
  numCols: number;
  gap: number; // px
  squareSize: number; // px
  active: boolean[][];
  flash: boolean[][];
  onToggle: (rowIndexFromBottom: number, colIndex: number) => void;
};

export default function SequencerGrid({
  numRows,
  numCols,
  gap,
  squareSize,
  active,
  flash,
  onToggle,
}: SequencerGridProps) {
  return (
    <div className="flex flex-col" style={{ gap }}>
      {Array.from({ length: numRows }).map((_, rTop) => {
        const r = numRows - 1 - rTop; // display top-to-bottom, bottom row is r=0
        return (
          <div key={rTop} className="flex" style={{ gap }}>
            {Array.from({ length: numCols }).map((_, c) => {
              const isOn = active[r][c];
              const isFlashing = flash[r][c];
              return (
                <div key={c} className="relative group" style={{ width: squareSize, height: squareSize }}>
                  <div
                    className={
                      isOn
                        ? "bg-white"
                        : "bg-[var(--gray)] group-hover:bg-[var(--lightgray)]"
                    }
                    style={{
                      width: "100%",
                      height: "100%",
                      boxShadow: isOn
                        ? isFlashing
                          ? "0 0 3px 3px white"
                          : "0 0 1px 1px white"
                        : undefined,
                    }}
                  />
                  <div
                    aria-hidden
                    onClick={() => onToggle(r, c)}
                    className="absolute cursor-pointer"
                    style={{ top: -(gap / 2), left: -(gap / 2), right: -(gap / 2), bottom: -(gap / 2) }}
                  />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}


