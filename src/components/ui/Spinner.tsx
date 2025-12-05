'use client';

export function Spinner() {
  return (
    <div className="flex items-center justify-center">
      <div
        className="border-4 border-[#D9E6DF] border-t-[#1B9C6F] rounded-full w-6 h-6 animate-spin"
      ></div>
    </div>
  );
}
