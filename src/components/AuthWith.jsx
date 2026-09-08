export default function AuthWith() {
  return (
    <div className="pt-6 border-t border-[#e2e8f0]">
      <h2 className="text-center mb-2 text-light-title text-[11px] font-bold">
        OR USE WITH
      </h2>
      <div className="flex justify-between items-center gap-3">
        <button className="w-full px-4 py-2 h-10 font-medium text-title rounded-md bg-gray-background cursor-pointer">
          Google
        </button>
        <button className="w-full px-4 py-2 h-10 font-medium text-title rounded-md bg-gray-background cursor-pointer">
          Facebook
        </button>
      </div>
    </div>
  );
}
